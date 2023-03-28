import base64
import time
import zlib
from random import randrange
from typing import List

from backend_api import consts
from backend_api.log import logger
from web3 import Web3, HTTPProvider

w3 = Web3(HTTPProvider(consts.ENDPOINT))

IS_DEV = True


def verbose_logger(func):
    def newfn(*args, **kwargs):
        ret = func(*args, **kwargs)
        if IS_DEV:
            logger.info(f'{func.__name__} {ret}')
        return ret
    newfn.__name__ = func.__name__
    return newfn


def retry(tag, fallbakc, retry_limit=3):
    def decorator(func):
        def newfn(*args, **kwargs):
            for i in range(retry_limit):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logger.info(f'failed retry time left {i} {e} retrying {tag} not found {args} {kwargs}')
                    time.sleep(3)
            return fallbakc

        return newfn

    return decorator


class CacheCleaner:
    CLEAN_SPAN = 60  # seconds
    TRANSACTION_TIME_LIMIT = 60 * 15

    def __init__(self, cache):
        self.cache = cache
        self.latest_clean_time = time.time()
        # Create your thread

    def clean(self):
        if time.time() - self.latest_clean_time > self.CLEAN_SPAN:
            logger.info('cleaning cache')
            # Cleaning long hauled pending txn back to pixel_listing
            cleaning_ptb = []
            for position, pending_txn in self.cache['pending_transaction_book'].items():
                if pending_txn[4] + self.TRANSACTION_TIME_LIMIT < time.time():
                    # Don't need to return website owned pixel back to the marketplace
                    if pending_txn[3] != 'N/A':
                        self.cache['pixels_listing'][position] = (pending_txn[0], pending_txn[3], pending_txn[1])
                    cleaning_ptb.append(position)
            for p in cleaning_ptb:
                logger.info(f'cleaning ptb {p}')
                del self.cache['pending_transaction_book'][p]


@retry('validate_txn', False, 1)
def validate_txn(txn_hash: str, amount, seller_address) -> bool:
    txn_receipt = w3.eth.get_transaction_receipt(txn_hash)
    if txn_receipt['to'].lower() != consts.TOKEN_ADDRESS.lower():
        raise Exception(f'to {txn_receipt["to"]} no match seller token {consts.TOKEN_ADDRESS}')
    if int(txn_receipt['status']) != 1:
        raise Exception(f'invalid transaction status')
    if len(txn_receipt['logs']) != 1:
        raise Exception(f'cannot detect txns with more than one log')
    if str(txn_receipt['logs'][0]['topics'][0].hex()).lower() != consts.TRANSFER_TOPIC.lower():
        raise Exception(
            f"log topic no match need {consts.TRANSFER_TOPIC} got {txn_receipt['logs'][0]['topics'][0].hex()}")
    if str(txn_receipt['logs'][0]['topics'][2].hex()).lower()[26:] != seller_address.lower()[2:]:
        raise Exception(f"reciver mismatch need {seller_address} got {txn_receipt['logs'][0]['topics'][2].hex()}")
    if int(txn_receipt['logs'][0]['data'], 16) < int(amount * (10 ** consts.TOKEN_DECIMAL)):
        raise Exception(
            f"transfer amount mismatch need {int(amount)} got {int(txn_receipt['logs'][0]['data'], 16) / (10 ** consts.TOKEN_DECIMAL)}")
    return True


def rgb_to_base64(r: int, g: int, b: int) -> str:
    bytes = r.to_bytes(1, byteorder='big') + g.to_bytes(1, byteorder='big') + b.to_bytes(1, byteorder='big')
    return base64.b64encode(bytes).decode("utf-8")


def base64_to_rgb(byte_string: str) -> List[int]:
    bytes = base64.b64decode(byte_string)
    return [int(b) for b in bytes]


def compress_function_demo():
    sample_pixels = [rgb_to_base64(randrange(256), randrange(256), randrange(256)) for _ in range(1000 * 1000)]
    base64_pixels = ''.join(sample_pixels)
    print(f'og string {len(base64_pixels)}')

    compressed_string = zlib.compress(str.encode(base64_pixels), 9)
    print(f'compressed to len {len(compressed_string)}')

    decompressed_string = zlib.decompress(compressed_string).decode('utf8')
    print(
        f'{type(decompressed_string)} decompressed length {len(decompressed_string)}, same? {decompressed_string == base64_pixels}')
    print(str(rgb_to_base64(255, 255, 255)) + str(rgb_to_base64(255, 255, 255)))
    print(base64_to_rgb('////'))


if __name__ == '__main__':
    print(rgb_to_base64(0, 0, 0))
    # For development purposes
    # db_set_user('john', 'passwd', 1, [4, 5])
    # print(db_get_all_pixel())
