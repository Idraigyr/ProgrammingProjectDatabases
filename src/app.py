import logging

from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

"""
This is the main entry point for the application.
"""


class Base(DeclarativeBase):
    pass


# Load environment variables
assert load_dotenv(".env"), "unable to load .env file"
from os import environ

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
    # Configure JWT
    app.config['JWT_ALGORITHM'] = 'HS256'  # HMAC SHA-256

    # Load the secret key from file
    with open(app.config['APP_JWT_SECRET_KEY'], 'rb') as f:
        app.config['JWT_SECRET_KEY'] = f.read()

    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

    # Create the JWT manager
    app.jwt = JWTManager(app)

    # Add a custom error handler for JWT errors
    _log = logging.getLogger("_jwt")

    @app.jwt.invalid_token_loader
    def custom_invalid_token_loader(callback):
        _log.debug(f"Invalid token (check format?): {callback}")
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    @app.jwt.unauthorized_loader
    def custom_unauthorized_loader(callback):
        _log.debug(f"Unauthorized (no header?): {callback}")
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    @app.jwt.expired_token_loader
    def custom_expired_token_loader(callback):
        _log.debug(f"Expired token (log back in): {callback}")
        return jsonify({'status': 'error', 'message': 'Token has expired (log back in)'}), 401


def setup(app: Flask):
    """
    Set up the Flask app with the given configuration from environment variables (in .env or system)
    Also initializes the database (SQLAlchemy), JWT manager and imports & registers the routes
    :param app: The flask app
    :return: None
    """

    # Load environment variables
    # assert load_dotenv(".env"), "unable to load .env file"
    # from os import environ

    # Configure the logger
    if environ.get('APP_DEBUG') == "true":
        logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
        logging.debug("Debug mode enabled")
    else:
        logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

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

    # Configre JWT
    setup_jwt(app)

    # Initialize the db with our Flask instance
    db.init_app(app)
    app.db = db

    # Lock the app context
    with app.app_context():
        # import routes INSIDE the app context
        import src.routes
        app.register_blueprint(src.routes.public_routes.public_routes)
        app.register_blueprint(src.routes.api_auth.api_auth, url_prefix='/api/auth')

        # Create the tables in the db, AFTER entities are imported
        db.create_all()

    return app


# RUN DEV SERVER

app = setup(app)

if __name__ == "__main__":
    # Finally, run the app
    # don't put this in the setup() as the WSGI server uses that function as well
    logging.info("Booting Flask Debug server")
    app.run(app.config['APP_BIND'], debug=app.config['APP_DEBUG'] or False)
