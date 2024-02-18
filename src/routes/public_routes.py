from flask.templating import render_template
from flask import Blueprint, current_app

public_routes = Blueprint('public_routes', __name__)

@public_routes.route("/")
def main():
    return render_template('index.html', app_name=current_app.config['APP_NAME'])

