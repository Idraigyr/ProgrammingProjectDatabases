from flask import Blueprint, current_app
from flask.templating import render_template

public_routes = Blueprint('public_routes', __name__)
db = current_app.db

@public_routes.route("/")
def main():
    return render_template('index.html', app_name=current_app.config['APP_NAME'])

@public_routes.route("/favicon.ico")
def send_favicon():
    return current_app.send_static_file(f"favicon.ico")

