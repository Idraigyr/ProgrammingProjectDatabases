from flask.templating import render_template
from flask import Blueprint, current_app, redirect
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.service.auth_service import AUTH_SERVICE

blueprint = Blueprint('public_routes', __name__)
db = current_app.db

# Disable JWT if not enabled, JWT is enabled by default
# We override the jwt_required decorator to be a no-op
# We also override the get_jwt_identity function to return the default user
if current_app.config.get('APP_JWT_ENABLED', 'true') == 'false':
    jwt_required = lambda: lambda x: x  # no-op decorator
    def f():
        # When JWT is disabled, return the default user (id=0)
        return AUTH_SERVICE.get_user(user_id=1)
    get_jwt_identity = f


@blueprint.route("/")
@jwt_required(optional=True)
def index():
    user = get_jwt_identity()

    if user is None:  # not logged in, redirect to landing page
        return redirect("/landing", code=302)
    else:
        username = AUTH_SERVICE.get_user(user_id=user).username
        return render_template('index.html', app_name=current_app.config['APP_NAME'], username=username)


@blueprint.route("/landing")
def landing():
    return render_template('landing-page.html', app_name=current_app.config['APP_NAME'])


@blueprint.route("/favicon.ico")
def send_favicon():
    return current_app.send_static_file("favicon.ico")

@blueprint.route("/login")
@jwt_required(optional=True)
def login():
    user = get_jwt_identity()
    if user is not None:  # already logged in
        return redirect("/", 302)
    else:
        return render_template('login.html', app_name=current_app.config['APP_NAME'])

@blueprint.route("/register")
@jwt_required(optional=True)
def register():
    user = get_jwt_identity()
    if user is not None:  # user already logged in
        return redirect("/", 302)
    else:
        return render_template('register.html', app_name=current_app.config['APP_NAME'])


@blueprint.route("/logout")
def logout():
    return redirect("/api/auth/logout", 302)