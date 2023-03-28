import logging

from wtforms import Form, BooleanField, StringField, PasswordField, validators, ValidationError, IntegerField
from . import consts
import string
from .log import logger

alpha_whitelist = set(string.ascii_letters + string.digits)
special_whitelist = set([str(c) for c in '!@#$%^&*']).union(alpha_whitelist)


def valid_username(form, field):
    try:
        if any([(c not in alpha_whitelist) for c in field.data]):
            raise ValidationError('Field must plain characters')
    except Exception as e:
        if e is ValidationError:
            raise e
        logger.error(f'invalid_username {e}')
        raise ValidationError('username validation failed')


def valid_hex(form, field):
    try:
        int(field.data, 16)
    except Exception as e:
        raise ValidationError('Txn hash must be valid 0x hexidecimal')


def valid_password(form, field):
    try:
        if any([(c not in special_whitelist) for c in field.data]):
            raise ValidationError('Too weird of special characters.')
    except Exception as e:
        if e is ValidationError:
            raise e
        logger.error(f'valid_password {e}')
        raise ValidationError('password validation failed')


class SignupForm(Form):
    username = StringField('username', [validators.InputRequired(),
                                        validators.Length(min=4, max=consts.USER_NAME_LENGTH_LIMIT),
                                        valid_username])
    password = PasswordField('password', [
        validators.Length(min=6, max=consts.PASSWORD_LENGTH_LIMIT),
        validators.InputRequired(),
        validators.EqualTo('confirm_password', message='Passwords must match'),
        valid_password
    ])
    confirm_password = PasswordField('confirm_password', [validators.InputRequired(),
                                                          valid_password])


class LoginForm(Form):
    username = StringField('username', [validators.Length(min=4, max=consts.USER_NAME_LENGTH_LIMIT), valid_username])
    password = PasswordField('password', [validators.InputRequired(), valid_password])


def int_size_validator(min, max):
    def validator(form, field):
        try:
            if int(field.data) < min or int(field.data) > max:
                raise ValidationError(f'int size limit reached need to be more than {min - 1} less than {max + 1}')
        except Exception as e:
            if e is ValidationError:
                raise e
            logger.error(f'invalid integer {e}')
            raise ValidationError(f'{e} validation failed')

    return validator


class ChangePixelForm(Form):
    position = IntegerField('position', [int_size_validator(0, consts.WIDTH * consts.HEIGHT - 1)])
    r = IntegerField('r', [int_size_validator(0, 255)])
    g = IntegerField('g', [int_size_validator(0, 255)])
    b = IntegerField('b', [int_size_validator(0, 255)])
    description = StringField('description', [validators.Length(min=0, max=100)])


class PurchaseRequestForm(Form):
    position = IntegerField('position', [int_size_validator(0, consts.WIDTH * consts.HEIGHT - 1)])


class ConfirmPurchaseForm(Form):
    position = IntegerField('position', [int_size_validator(0, consts.WIDTH * consts.HEIGHT - 1)])
    transaction_hash = StringField('transaction_hash', [validators.InputRequired(),
                                                        validators.Length(min=66, max=66),
                                                        valid_hex])


class RequestListingForm(Form):
    position = IntegerField('position', [int_size_validator(0, consts.WIDTH * consts.HEIGHT - 1)])
    amount = IntegerField('amount', [int_size_validator(0, 10000)])
    wallet_address = StringField('wallet_address', [validators.InputRequired(),
                                                    validators.Length(min=42, max=42),
                                                    valid_hex])
class RecallListingForm(Form):
    position = IntegerField('position', [int_size_validator(0, consts.WIDTH * consts.HEIGHT - 1)])
