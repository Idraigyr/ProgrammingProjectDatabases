from flask.templating import render_template
from flask import Blueprint, current_app, redirect

public_routes = Blueprint('public_routes', __name__)
db = current_app.db

@public_routes.route("/")
def main():
    return render_template('index.html', app_name=current_app.config['APP_NAME'])


@public_routes.route("/landing")
def landing():
    return render_template('landing-page.html', app_name=current_app.config['APP_NAME'])


@public_routes.route("/favicon.ico")
def send_favicon():
    return current_app.send_static_file("favicon.ico")

