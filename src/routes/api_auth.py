from flask import Blueprint, current_app, Response
from src.service.auth_service import AuthService, AUTH_SERVICE

api_auth = Blueprint('api_auth', __name__)
db = current_app.db

@api_auth.route("/register")
def register():
    return Response("Not implemented yet", status=501, mimetype='application/json')

@api_auth.route("/login")
def login():


    # TODO - return JWT token : https://flask-jwt-extended.readthedocs.io/en/stable/
    # TODO - generate docs : https://www.sphinx-doc.org/en/master/usage/quickstart.html
    return Response("Not implemented yet", status=501, mimetype='application/json')

@api_auth.route("/ssologin")
def sso_login():
    # implement SSO login
    return Response("Not implemented yet", status=501, mimetype='application/json')

