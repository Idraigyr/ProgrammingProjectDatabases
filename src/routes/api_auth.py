import json
import logging

from flask import Blueprint, current_app, Response, request
from flask_jwt_extended import set_access_cookies, unset_jwt_cookies, jwt_required
from markupsafe import escape

from src.service.auth_service import AUTH_SERVICE

# Create the blueprint
blueprint = Blueprint('api_auth', __name__)

# Utliity variables
db = current_app.db
_log = logging.getLogger(__name__)

# Disable JWT if not enabled, JWT is enabled by default
# We override the jwt_required decorator to be a no-op
# We also override the get_jwt_identity function to return the default user
if current_app.config.get('APP_JWT_ENABLED', 'true') == 'false':
    jwt_required = lambda *args, **kwargs: lambda x: x  # no-op decorator
    def f():
        # When JWT is disabled, return the default user (id=0)
        return AUTH_SERVICE.get_user(user_id=1)
    get_jwt_identity = f


@blueprint.route("/register", methods=['POST'])
def register():
    """
    REST API endpoint for user registration
    Requires username, password, firstname and lastname as query parameters
    :return: Response
    """
    if current_app.config.get('APP_REGISTRATION_ENABLED', 'true') != 'true':
        return Response(json.dumps({'status': 'error', 'message': "Registration not enabled"}), status=409, mimetype='application/json')

    # Check if username and password are provided
    if ('username' not in request.args
            or 'password' not in request.args
            or 'firstname' not in request.args
            or 'lastname' not in request.args):
        return Response(json.dumps({'status': 'error', 'message': 'incorrect number of parameters'}), status=400, mimetype='application/json')

    # Clean input
    username = escape(request.args.get('username'))
    password = escape(request.args.get('password'))
    firstname = escape(request.args.get('firstname'))
    lastname = escape(request.args.get('lastname'))

    # Check if username is already taken
    if AUTH_SERVICE.get_user(username=username) is not None:
        return Response(json.dumps({'status': 'error', 'message': 'username already taken'}), status=409, mimetype='application/json')

    # Create user
    user = AUTH_SERVICE.create_user_password(username, password, firstname, lastname)
    jwt = AUTH_SERVICE.create_jwt(user)

    # Return response
    response = Response(json.dumps({
        'status': 'success',
        'jwt': jwt,
        'ttl': current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'user': {
            'id': user.id,
            'firstname': user.firstname,
            'lastname': user.lastname,
            'username': user.username
        }
    }), status=200, mimetype='application/json')

    set_access_cookies(response, jwt) # Set the JWT in the response as a cookie
    return response


@blueprint.route("/login", methods=['POST'])
def login():
    """
    REST API endpoint for user-password login
    Requires username and password as query parameters
    Attempts authentication and returns a JWT token if successful
    If not successful, returns an error message
    :return: Response
    """
    if current_app.config.get('APP_LOGIN_ENABLED', 'true')!= 'true':
        return Response(json.dumps({'status': 'error', 'message': "Login not enabled"}), status=409, mimetype='application/json')

    # Check if username and password are provided
    if 'username' not in request.args or 'password' not in request.args:
        return Response(json.dumps({'status': 'error', 'message': 'username and password not provided'}), status=400, mimetype='application/json')

    # Clean input
    username = escape(request.args.get('username'))
    password = escape(request.args.get('password'))

    # Attempt authentication
    user = AUTH_SERVICE.authenticate(username, password)
    if user is None: # either username does not exist or password is incorrect
        return Response(json.dumps({'status': 'error', 'message': 'username not found or incorrect password'}), status=401, mimetype='application/json')

    # Generate JWT token
    jwt = AUTH_SERVICE.create_jwt(user)

    # Return response
    response = Response(json.dumps({'status': 'success', 'jwt': jwt, 'ttl': current_app.config['JWT_ACCESS_TOKEN_EXPIRES']}), status=200, mimetype='application/json')
    set_access_cookies(response, jwt) # Set the JWT in the response as a cookie
    return response

@blueprint.route("/logout", methods=['POST', 'GET'])
@jwt_required(optional=True)
def logout():
    """
    REST API endpoint for user logout
    Requires a valid JWT token to be provided
    :return: Response
    """
    response = Response(json.dumps({'status': 'success', 'message': 'Logged out'}), status=200, mimetype='application/json')
    unset_jwt_cookies(response) # Unset the JWT in the response as a cookie
    return response


@blueprint.route("/ssologin")
def sso_login():
    # implement SSO login
    return Response("Not implemented yet", status=501, mimetype='application/json')
