from flask import Flask
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

"""
This is the main entry point for the application.
"""

# Load environment variables
assert load_dotenv("../.env"), "unable to load .env file"
from os import environ

# Create the Flask app
app = Flask(environ.get('APP_NAME'))

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
class Base(DeclarativeBase):
    pass

app.config['SQLALCHEMY_DATABASE_URI'] = \
    (f"postgresql://{app.config['APP_POSTGRES_USER']}:{app.config['APP_POSTGRES_PASSWORD']}"
     f"@{app.config['APP_POSTGRES_HOST']}:{app.config['APP_POSTGRES_PORT']}"
     f"/{app.config['APP_POSTGRES_DATABASE']}")

db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Create the tables in the db
with app.app_context():
    db.create_all()

# Configure Jinja2 template dir


# import routes
import src.routes
app.register_blueprint(src.routes.public_routes.public_routes)

# RUN DEV SERVER
if __name__ == "__main__":
    print("Booting Flask Debug server")
    app.run(environ.get('APP_BIND'), debug=app.config['APP_DEBUG'] or False)
