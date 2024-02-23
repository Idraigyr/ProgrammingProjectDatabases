from flask.templating import render_template
from flask import Blueprint, current_app
import src.test_entity

public_routes = Blueprint('public_routes', __name__)
db = current_app.db

@public_routes.route("/")
def main():
    test = src.test_entity.TestEntity("test1234")
    db.session.add(test)
    db.session.commit()
    return render_template('index.html', app_name=current_app.config['APP_NAME'])

@public_routes.route("/landing")
def landing():
    return render_template('landing-page.html', app_name=current_app.config['APP_NAME'])

