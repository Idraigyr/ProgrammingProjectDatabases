import logging

from flask import Flask
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from logging.config import dictConfig



"""
This is the main entry point for the application.
"""

class Base(DeclarativeBase):
    pass

db: SQLAlchemy = SQLAlchemy(model_class=Base)

def setup():
    # Load environment variables
    assert load_dotenv("../.env"), "unable to load .env file"
    from os import environ

    # Configure the logger
    if environ.get('APP_DEBUG'):
        logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
        logging.debug("Debug mode enabled")
    else:
        logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

    # Create the Flask app
    app: Flask = Flask(environ.get('APP_NAME'))

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

    # Initialize the db with our Flask instance
    db.init_app(app)
    app.db = db

    # Lock the app context
    with app.app_context():
        # import routes INSIDE the app context
        import src.routes
        app.register_blueprint(src.routes.public_routes.public_routes)

        # Create the tables in the db, AFTER entities are imported
        db.create_all()

        # Temp test
        from test_entity import TestEntity
        logging.debug(TestEntity.query.all())

    return app


# RUN DEV SERVER
if __name__ == "__main__":
    app = setup()

    # Finally, run the app
    # don't put this in the setup() as the WSGI server uses that function as well
    logging.info("Booting Flask Debug server")
    app.run(app.config['APP_BIND'], debug=app.config['APP_DEBUG'] or False)
