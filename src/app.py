import logging
import os
from json import JSONEncoder

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_migrate import check as check_db_schema
from flask_migrate import upgrade as upgrade_db_schema
from flask_restful_swagger_3 import get_swagger_blueprint
from flask_sqlalchemy import SQLAlchemy
from oauthlib.oauth2 import WebApplicationClient
from sqlalchemy.orm import DeclarativeBase


"""
This is the main entry point for the application.
"""


class Base(DeclarativeBase):
    pass


class JSONClassEncoder:
    """
    JSON Encoder that calls to_json() on objects
    """

    def __init__(self, *args, **kwargs):
        pass

    def default(self, o):
        if hasattr(o, 'to_json'):
            return JSONEncoder().default(o.to_json())
        else:
            return JSONEncoder().default(o)

    def encode(self, o):
        if hasattr(o, 'to_json'):
            return JSONEncoder().encode(o.to_json())
        else:
            return JSONEncoder().encode(o)


# Load environment variables
assert load_dotenv(".env"), "unable to load .env file"
from os import environ

# Configure the logger
if environ.get('APP_DEBUG', "false") == "true":
    logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
    logging.debug("Debug mode enabled")
else:
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

db: SQLAlchemy = SQLAlchemy(model_class=Base)
app: Flask = Flask(environ.get('APP_NAME'))


def setup_jwt(app: Flask):
    """
    Setup the JWT manager for the given Flask app
    Uses the APP_JWT_SECRET_KEY environment variable to load the secret key

    Generate a secret key with:
    <pre>
    import secrets
    with open('jwtRS256.key', 'wb') as f:
         f.write(secrets.token_bytes(256))
    </pre>

    :param app:
    :return:
    """
    logging.debug("Setting up JWT")
    # Configure JWT
    app.config['JWT_ALGORITHM'] = 'HS256'  # HMAC SHA-256

    # Load the secret key from file
    with open(app.config['APP_JWT_SECRET_KEY'], 'rb') as f:  # The secret key to sign our JWTs with
        app.config['JWT_SECRET_KEY'] = f.read()

    app.config['JWT_TOKEN_LOCATION'] = ['cookies']  # only look for tokens in the cookies
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # token expiers 1 hour
    app.config['JWT_SESSION_COOKIE'] = True  # Use cookies for session, removed once browser closes
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF protection (for now)
    app.config['JWT_COOKIE_SECURE'] = app.config.get('APP_HOST_SCHEME',
                                                     'https') == 'https'  # Serve cookies only over HTTPS, default to do so

    # Create the JWT manager
    app.jwt = JWTManager(app)

    # Add a custom error handler for JWT errors
    _jwt_log = logging.getLogger("_jwt")

    @app.jwt.invalid_token_loader
    def custom_invalid_token_loader(callback):
        _jwt_log.debug(f"Invalid token (check format?): {callback}")
        return jsonify({'status': 'error', 'message': 'Unauthorized', 'type': 'jwt_invalid_token'}), 401

    @app.jwt.unauthorized_loader
    def custom_unauthorized_loader(callback):
        _jwt_log.debug(f"Unauthorized (no cookie?): {callback}")
        return jsonify({'status': 'error', 'message': 'Unauthorized', 'type': 'jwt_no_cookie'}), 401

    @app.jwt.expired_token_loader
    def custom_expired_token_loader(jwt_header, jwt_data):
        _jwt_log.debug(f"Expired token (log back in): {jwt_header}, {jwt_data}")
        return jsonify(
            {'status': 'error', 'message': 'Token has expired (log back in)', 'type': 'jwt_token_expired'}), 401


def setup(app: Flask):
    """
    Set up the Flask app with the given configuration from environment variables (in .env or system)
    Also initializes the database (SQLAlchemy), JWT manager and imports & registers the routes
    :param app: The flask app
    :return: None
    """
    logging.debug("Setting up app")

    # Create the Flask app
    # app: Flask = Flask()

    # Key differs in production, this is good enough for dev purposes
    app.secret_key = environ.get('APP_SECRET_KEY') or '*^*(*&)(*)(*afafafaSDD47j\3yX R~X@H!jmM]Lwf/,?KT'

    # Load config variables from environment variables
    for var in environ:
        if var.startswith('APP_'):
            app.config[var] = environ.get(var)

    # Check if requires config variables are set
    assert app.config.get('APP_POSTGRES_USER') is not None, "POSTGRES_USER not set"
    assert app.config.get('APP_POSTGRES_DATABASE') is not None, "POSTGRES_DATABASE not set"
    assert app.config.get('APP_NAME') is not None, "APP_NAME not set"

    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = \
        (f"postgresql://{app.config['APP_POSTGRES_USER']}:{app.config['APP_POSTGRES_PASSWORD']}"
         f"@{app.config['APP_POSTGRES_HOST']}:{app.config['APP_POSTGRES_PORT']}"
         f"/{app.config['APP_POSTGRES_DATABASE']}")

    # Needed to have Flask to propagate exceptions in order to have the JWT exception handlers to work properly
    # See SCRUM-45
    app.config['PROPAGATE_EXCEPTIONS'] = True

    # Configre JWT
    setup_jwt(app)

    # Initialize the db with our Flask instance
    db.init_app(app)
    app.db = db

    # Configure OAuth2 client
    if app.config.get("APP_DEBUG", "false") == "true":
        # Allow insecure transport in debug mode
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    # Initialize the OAuth2 client, this client will be used to authenticate users with the OAuth2 (Google) server
    app.oauth_client = None
    if app.config.get('APP_OAUTH_ENABLED', 'false') == 'true':
        app.oauth_client = WebApplicationClient(app.config['APP_OAUTH_CLIENT_ID'])

    # Lock the app context
    with app.app_context():
        # import socket INSIDE the app context
        from src.chatBox import socketio

        # import routes INSIDE the app context

        import src.routes
        app.register_blueprint(src.routes.public_routes.blueprint)
        app.register_blueprint(src.routes.api_auth.blueprint, url_prefix='/api/auth')

        # Create the tables in the db, AFTER entities are imported
        # Create the DB migration manager
        app.migrate = Migrate(app=app, db=app.db, directory='migrations')

        if app.config.get('APP_AUTOMIGRATE', "true") == "true":
            # Automatically migrate the database
            upgrade_db_schema()

        if app.config.get('APP_DISABLE_SCHEMA_VALIDATION', "false") != "true":
            # Check if the database schema is up to date
            # We allow inconsistencies in debug mode, but not in production
            check_db_schema()

        # Register custom JSON Encoder to call to_json() on objects
        # This is so that Flask can jsonify our SQLAlchemy models
        app.config['RESTFUL_JSON'] = {'cls': JSONClassEncoder}

        # Create all API endpoints
        from src.resource import attach_resources
        attach_resources(app)

        # Setup SWAGGER API documentation (only when enabled)
        if app.config.get('APP_SWAGGER_ENABLED', "false") == 'true':
            from src.resource import openapi_dict
            logging.info("Setting up Swagger API documentation")
            app.config['SWAGGER_BLUEPRINT_URL_PREFIX'] = '/api/docs'
            swagger_url = app.config.get('APP_SWAGGER_URL', '/api/docs')
            api_url = app.config.get('APP_SWAGGER_API_URL', '/static/swagger.json')
            resource = get_swagger_blueprint(openapi_dict, add_api_spec_resource=True,
                                             swagger_url=swagger_url, swagger_prefix_url=api_url,
                                             title=app.config['APP_NAME'])
            app.register_blueprint(resource, url_prefix=swagger_url)
        socketio.init_app(app)
    return app, socketio


# RUN DEV SERVER

app, socketio = setup(app)


if __name__ == "__main__":
    # Finally, run the app
    # don't put this in the setup() as the WSGI server uses that function as well
    logging.info("Booting Flask Debug server")
    app_bind = app.config['APP_BIND']
    debug = app.config['APP_DEBUG'] or False
    socketio.run(app, debug=debug, allow_unsafe_werkzeug=True)
