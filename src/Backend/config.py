from dotenv import load_dotenv
load_dotenv("../../.env")
from os import environ

config_data = dict()
config_data['app_name'] = 'ProgDB Tutor'
config_data['dbname'] = environ.get('POSTGRES_DATABASE')
config_data['dbuser'] = environ.get('POSTGRES_USER')
config_data['host'] = environ.get('POSTGRES_HOST')