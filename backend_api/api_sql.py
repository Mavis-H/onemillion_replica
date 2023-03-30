import base64
import random
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

from typing import List, Dict
from werkzeug.exceptions import NotFound
from dotenv import load_dotenv
from . import app, consts, log
from sqlalchemy import delete

logger = log.logger
load_dotenv('.flaskenv')

db = SQLAlchemy(app)


def error_handle(tag, fall_back):
    def decorator(func):
        def newfn(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except NotFound as e:
                logger.info(f'query {tag} not found {args} {kwargs}')
                return fall_back

        return newfn

    return decorator


class AnonymousUser(object):
    username = ''
    '''
    This is the default object for representing an anonymous user.
    '''

    @property
    def is_authenticated(self):
        return False

    @property
    def is_active(self):
        return False

    @property
    def is_anonymous(self):
        return True

    def get_id(self):
        return

    def to_dict(self):
        return {'username': self.username,
                'money': '',
                'pixels': []}


class User(db.Model):
    username = db.Column(db.String(consts.USER_NAME_LENGTH_LIMIT), unique=True, nullable=False, primary_key=True)
    password_hash = db.Column(db.String(128), unique=False, nullable=False)
    money = db.Column(db.Integer, unique=False, nullable=False, default=0)
    pixels = db.Column(db.ARRAY(db.Integer), unique=False, nullable=False, default=[])
    authenticated = False

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return self.username == ''

    @property
    def is_active(self):
        return len(self.pixels) > 0

    def get_id(self):
        return self.username

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute!')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Create A String
    def __repr__(self):
        return f'{self.username} with {self.money} and properties {self.pixels}'

    def to_dict(self):
        return {'username': self.username,
                'money': self.money,
                'pixels': self.pixels}


def anon_user():
    return User(username='', password='', money=0, pixels=[])


class Pixel(db.Model):
    position = db.Column(db.Integer, primary_key=True, index=False, autoincrement=False)
    rgb = db.Column(db.String, unique=False, nullable=True)
    user = db.Column(db.String, unique=False, nullable=True)
    description = db.Column(db.String, unique=False, nullable=True)

    def to_base64(self) -> str:
        """
        :return: a base64 encoded string of first [0:4) as position in int and [4:] as rgb
        """
        bytes = self.position.to_bytes(3, byteorder='big')
        return base64.b64encode(bytes).decode("utf-8") + self.rgb

    def to_json(self) -> Dict:
        return {'position': self.position, 'rgb': self.rgb, 'user': self.user, 'description': self.description}


class PixelListing(db.Model):
    position = db.Column(db.Integer, primary_key=True, index=False, autoincrement=False)
    amount = db.Column(db.Integer, unique=False, nullable=False)
    seller = db.Column(db.String, unique=False, nullable=False)
    address = db.Column(db.String, unique=False, nullable=False)

    def to_tuple(self):
        return self.amount, self.seller, self.address


@error_handle('get_all_pixels', {})
def db_get_all_pixel_listing() -> Dict:
    pixel_listings = PixelListing.query.all()
    res = {}
    for p in pixel_listings:
        res[p.position] = p.to_tuple()
    return res


@error_handle('set_pixel_listing', False)
def db_set_pixel_listing(position: int, amount: int, seller: str, address: str) -> bool:
    if db_user_have_pixel(position, seller):
        stmt = delete(PixelListing).where(PixelListing.position == position).execution_options(
            synchronize_session="fetch")
        db.session.execute(stmt)

        db.session.add(PixelListing(position=position, amount=amount, seller=seller, address=address))
        db.session.commit()
        logger.info(f'pixel {position} {amount} {seller} {address} listed')
        return True
    else:
        return False


@error_handle('delete_pixel_listing', False)
def db_delete_pixel_listing(position: int, username: str) -> bool:
    if db_user_have_pixel(position, username):
        stmt = delete(PixelListing).where(PixelListing.position == position).execution_options(
            synchronize_session="fetch")
        db.session.execute(stmt)
        db.session.commit()
        logger.info(f'pixel {position} deleted in listing')
        return True
    else:

        return False


@error_handle('transfer_pixel', False)
def db_transfer_pixel(pre_owner: str, new_owner: str, position: int) -> bool:
    if db_user_have_pixel(position, pre_owner):
        stmt = delete(Pixel).where(Pixel.position == position).execution_options(synchronize_session="fetch")
        db.session.execute(stmt)

        db.session.add(Pixel(user=new_owner, position=position, rgb='AAAA', description=''))
        db.session.commit()
        logger.info(f'pixel transferred from {pre_owner} to {new_owner} at {position}')
        return True
    else:
        return False
    

@error_handle('buy_pixel', False)
def db_buy_pixel(new_owner: str, position: int) -> bool:
    db.session.add(Pixel(user=new_owner, position=position, rgb='AAAA', description=''))
    db.session.commit()
    logger.info(f'{new_owner} bought pixel from website at {position}')
    return True


@error_handle('insert_initial_pixel_art', False)
def db_insert_pixel_art() -> bool:
    logger.info("Initial pixel art is inserted to user mavis1.")
    for g in range(0,5):
        for i in range(g*200+0,g*200+20):
            for j in range(20):
                pos = i*1000 + j
                for m in range(5):
                    random_rgb = random.choice(consts.INITIAL_COLOR_PALETTE)
                    db.session.add(Pixel(user="mavis1", position=pos+200*m, rgb=random_rgb, description=''))
        for i in range(g*200+20,g*200+40):
            for j in range(20,40):
                pos = i*1000 + j
                for m in range(5):
                    random_rgb = random.choice(consts.INITIAL_COLOR_PALETTE)
                    db.session.add(Pixel(user="mavis1", position=pos+200*m, rgb=random_rgb, description=''))
    db.session.commit()
    return True


@error_handle('set_pixel', False)
def db_set_pixel(username: str, position: int, rgb: str, description: str) -> bool:
    if db_user_have_pixel(position, username):
        stmt = delete(Pixel).where(Pixel.position == position).execution_options(synchronize_session="fetch")
        db.session.execute(stmt)

        db.session.add(Pixel(user=username, position=position, rgb=rgb, description=description))
        db.session.commit()
        logger.info(f'pixel created {username} {position} {rgb} {description}')
        return True
    else:
        return False


@error_handle('get_all_pixel', {})
def db_get_all_pixel() -> Dict:
    pixels = Pixel.query.all()
    res = {}
    for p in pixels:
        res[p.position] = p
    return res


@error_handle('check_user_pixel', False)
def db_user_have_pixel(position: int, username: str):
    q = Pixel.query.filter(Pixel.position == position).filter(Pixel.user == username).exists()
    res = db.session.query(q)
    return res.one()[0]


@error_handle('get_user', {})
def db_get_user(user_id: str) -> User:
    user_info = User.query.get_or_404(user_id)
    return user_info


@error_handle('exists_user', False)
def db_exists_user(user_id: str) -> bool:
    q = User.query.filter(User.username == user_id).exists()
    res = db.session.query(q)
    return res.one()[0]


@error_handle('set_user', False)
def db_set_user(user_name: str, password: str, money: int = 0, pixels=None) -> bool:
    if pixels is None:
        pixels = []
    db.session.add(User(username=user_name, password=password, money=money, pixels=pixels))
    db.session.commit()
    logger.info(f'user created {user_name} {money} {pixels} {password}')
    return True


db.create_all()
db.session.commit()

if __name__ == '__main__':
    # print(int_to_base64(255*255*255))
    # For development purposes
    # db_set_user('john', 'passwd', 1, [4, 5])
    print(db_user_have_pixel(2, ''))
