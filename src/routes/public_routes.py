from flask.templating import render_template
from flask import Blueprint, current_app
import test_entity

public_routes = Blueprint('public_routes', __name__)


@public_routes.route("/")
def main():
    test = test_entity.TestEntity("test1234")
    current_app.db.session.add(test)
    current_app.db.session.commit()
    return render_template('index.html', app_name=current_app.config['APP_NAME'])

