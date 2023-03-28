import datetime
import time

import flask
from .form_validation import SignupForm, LoginForm, ChangePixelForm, PurchaseRequestForm, ConfirmPurchaseForm, \
    RequestListingForm, RecallListingForm
from flask import request
from dotenv import load_dotenv
from .log import logger
from .api_sql import db_get_user, db_exists_user, db_set_user, db_get_all_pixel, User, anon_user, db_user_have_pixel, \
    db_set_pixel, AnonymousUser, db_transfer_pixel, Pixel, db_get_all_pixel_listing, db_set_pixel_listing, \
    db_delete_pixel_listing, db_buy_pixel
from flask_login import LoginManager, login_required, logout_user, login_user, current_user
from . import app
from .utility import rgb_to_base64, CacheCleaner, validate_txn, verbose_logger
from .consts import WEBSITE_WALLET_ADDRESS




load_dotenv('.flaskenv')
login_manager = LoginManager()

login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.anonymous_user = AnonymousUser

cache = {
    # Need to get this from data base
    'matrix': db_get_all_pixel(),
    # Dict[Int, Tuple[amount:0,
    # seller_address:1, \
    # buyer_username:2,
    # seller_username:3,
    # purchase_timestamp:4]
    'pending_transaction_book': {},
    # Dict[Int, Tuple[Int, str] position: (amount, seller, address)
    'pixels_listing': db_get_all_pixel_listing()
}
cache_cleaner = CacheCleaner(cache)

def encode_matrix_string():
    encoded_string = ''.join([pixel.to_base64() for position, pixel in cache['matrix'].items()])
    return encoded_string


@app.route('/request_listing', methods=['POST'])
@login_required
@verbose_logger
def request_listing():
    form = RequestListingForm(request.form)
    if not form.validate():
        return {'error': f'requesting listing failed {form.errors}'}
    position = form.data['position']
    if not db_user_have_pixel(position, current_user.username):
        return {'error': f'user {current_user.username} not own pixel'}
    if position in cache['pixels_listing']:
        return {'error': f'pixel listing {position} is already listed'}
    if position in cache['pending_transaction_book']:
        return {'error': f'pixel at {position} is pending transaction'}
    # Update the actually listing
    if db_set_pixel_listing(position=position, amount=form.data['amount'], seller=current_user.username,
                            address=form.data['wallet_address']):
        cache['pixels_listing'][position] = (form.data['amount'], current_user.username, form.data['wallet_address'])
        return {'success': 'listing updated successfully'}
    else:
        return {'error': f'listing not inserted'}


@app.route('/recall_listing', methods=['POST'])
@login_required
@verbose_logger
def recall_listing():
    cache_cleaner.clean()
    form = RecallListingForm(request.form)
    if not form.validate():
        return {'error': f'recalling listing failed {form.errors}'}
    username = current_user.username
    position = form.data['position']
    if not db_user_have_pixel(position, username):
        return {'error': 'current user not authorized'}
    if position not in cache['pixels_listing']:
        if position in cache['pending_transaction_book']:
            return {'error': 'too late to recall, pixel is under transaction'}
        return {'error': 'pixel is not selling'}
    if db_delete_pixel_listing(position, username):
        del cache['pixels_listing'][position]
        return {'success': f'successfully recalled listing at {position}'}
    return {'error': f'listing at {position} failed'}

@app.route('/confirm_purchase', methods=['POST'])
@login_required
@verbose_logger
def confirm_purchase():
    form = ConfirmPurchaseForm(request.form)
    if not form.validate():
        return {'error': f'confirm purchase failed {form.errors}'}
    position = form.data['position']

    ptb_entry = cache['pending_transaction_book'].get(position, None)
    if ptb_entry is None:
        return {'error': f'cannot find pixel at {position} in ptb'}
    amount = ptb_entry[0]
    seller_address = ptb_entry[1]
    if validate_txn(txn_hash=form.data['transaction_hash'], amount=amount, seller_address=seller_address):
        # Add logic for transfering ownership
        del cache['pending_transaction_book'][position]
        pre_owner = ptb_entry[3]
        new_owner = current_user.username
        if pre_owner == 'N/A':
            res = db_buy_pixel(new_owner=new_owner, position=position)
            if res:
                cache['matrix'][position] = Pixel(user=new_owner, position=position, rgb='AAAA', description='')
                return {'success': f'purchase at {position} from website confirmed'}
        else:
            res = db_transfer_pixel(pre_owner=pre_owner, new_owner=new_owner, position=position)
            if res:
                cache['matrix'][position].user = new_owner
                return {'success': f'purchase at {position} from {pre_owner} confirmed'}
    return {'error': f'purchased pixel at {position} failed'}


@app.route('/pixel_detail/<position>', methods=['GET'])
@verbose_logger
def get_pixel_detail(position: int):
    try:
        position = int(position)
        if position in cache['matrix']:
            return cache['matrix'].get(position).to_json()
    except:
        pass
    return {'error': f'pixel {position} not owned by anyone'}


@app.route('/pixels_listing', methods=['GET'])
@verbose_logger
def get_pixels_listing():
    cache_cleaner.clean()
    return cache['pixels_listing']


@app.route('/pending_transaction_book', methods=['GET'])
@verbose_logger
def get_pending_transaction_book():
    cache_cleaner.clean()
    return cache['pending_transaction_book']


@app.route('/request_purchase', methods=['POST'])
@login_required
@verbose_logger
def request_purchase():
    cache_cleaner.clean()
    # This is vuln to race condition
    form = PurchaseRequestForm(request.form)
    timestamp = time.time()
    if not form.validate():
        return {'error': f'{form.errors}'}
    # check for if purchase of interest is in listing_pixels
    position = form.data['position']
    isowned = 'error' not in get_pixel_detail(position)
    # pixel owned by website can also be purchased
    if position not in cache['pixels_listing'] and isowned:
        return {'error': f'pixel at {position} is not selling'}
    if isowned and (cache['pixels_listing'][position][1] == current_user.username):
        return {'error': f'cannot purchase own property at {position}'}
    if position not in cache['pending_transaction_book']:
        buyer_username = current_user.username
        if isowned:
            amount = cache['pixels_listing'][position][0]
            seller_address = cache['pixels_listing'][position][2]
            seller_username = cache['pixels_listing'][position][1]
        else:
            amount = 1
            seller_address = WEBSITE_WALLET_ADDRESS
            seller_username = 'N/A'
        cache['pending_transaction_book'][position] = (
            amount, seller_address, buyer_username, seller_username, timestamp)
        response = {'success': {'wallet': seller_address,
                                'amount': amount,
                                'seller': seller_username}}
        if isowned and db_delete_pixel_listing(position, seller_username):
            del cache['pixels_listing'][position]
        return response
    return {'error': f'pixel at {position} is not selling'}


# 0 depth for 1000x1000, 1 depth for 4000x4000, 2 for 16000x16000
@app.route('/matrix')
@verbose_logger
def get_matrix(user=None, depth_level=0):
    if user is None:
        # return global matrix for all users
        logger.info('getting global matrix')
        return encode_matrix_string()


# 0 depth for 1000x1000, 1 depth for 4000x4000, 2 for 16000x16000
@app.route('/get_user', methods=['GET'])
@verbose_logger
def get_user():
    username = request.args.get('username', '')
    if username:
        return load_user(user_id=username).to_dict()
    return current_user.to_dict()


@app.route('/get_user_pixels', methods=['GET'])
@login_required
@verbose_logger
def get_user_pixels():
    username = current_user.username
    user_pixel = []
    for position, pixel in cache['matrix'].items():
        res = pixel.to_json()
        if res['user'] == username:
            if position in cache['pending_transaction_book']:
                res['state'] = 'transaction_pending'
            elif position in cache['pixels_listing']:
                res['state'] = 'selling'
            else:
                res['state'] = 'own'
            user_pixel.append(res)
    return {'pixels': user_pixel}


# Create Logout Page
@app.route('/logout', methods=['GET', 'POST'])
@login_required
@verbose_logger
def logout():
    logout_user()
    return {'success': 'logged out'}


@app.route('/login', methods=['POST', 'GET'])
@verbose_logger
def login():
    if request.args.get('next') is not None:
        return {'error': 'not logged in, does not support redirect'}
    if current_user.username != '':
        return {'error': f'user {current_user.username} is already logged in'}
    form = LoginForm(request.form)
    if not form.validate():
        return {'error': f'user login failed {form.errors}'}
    user: User = load_user(form.data['username'])
    if isinstance(user, User):
        if user.verify_password(form.data['password']):
            res = login_user(user=user, force=True)
            if res:
                return {'success': f'user {form.data["username"]} logged in'}
            else:
                return {'error': f'user login failed'}
        else: 
            return {'error': f'wrong password'}
    else:
        return {'error': f'user does not exist'}


@app.route('/signup', methods=['POST'])
@verbose_logger
def set_user():
    form = SignupForm(request.form)
    if not form.validate():
        return {'error': f'user signup failed {form.errors}'}
    # Check user_name exists:
    if not db_exists_user(form.data['username']):
        res = db_set_user(user_name=form.data['username'], password=form.data['password'])
        if res:
            return {'success': f'user {form.data["username"]} created'}
        return {'error': 'user signup failed'}
    else:
        return {'error': 'user already exists'}


@app.route('/set_pixel', methods=['POST'])
@login_required
@verbose_logger
def set_pixel():
    form = ChangePixelForm(request.form)
    if not form.validate():
        return {'error': f'set_pixel failed {form.errors}'}
    position = form.data['position']
    if db_user_have_pixel(position=position, username=current_user.username):
        rgb = rgb_to_base64(form.data['r'], form.data['g'], form.data['b'])
        description = form.data['description']
        res = db_set_pixel(username=current_user.username,
                           position=position,
                           rgb=rgb,
                           description=description)
        if res:
            cache['matrix'][position].rgb = rgb
            cache['matrix'][position].description = description
            return {
                'success': f'pixel changed for {position} with {description} R{form.data["r"]}G{form.data["g"]}B{form.data["b"]}'}
        else:
            return {'error': 'changing pixel failed'}
    else:
        return {'error': "failed changing pixel user doesn't have authroity"}


@login_manager.user_loader
def load_user(user_id):
    if db_exists_user(user_id):
        return db_get_user(user_id)
    return AnonymousUser()
