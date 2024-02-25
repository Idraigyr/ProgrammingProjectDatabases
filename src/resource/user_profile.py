import logging

from flask import Flask, Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api
from markupsafe import escape

from src.resource import add_swagger, clean_dict_input
from src.service.auth_service import AUTH_SERVICE


class UserProfileResource(Resource):
    """
    A UserProfile resource is a resource/api endpoint that allows for the retrieval and modification of user profiles

    This resource is protected by JWT, and requires a valid JWT token to access
    """

    @swagger.tags('user_profile')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The user profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.response(200, description='Success, returns the user profile in JSON format')
    @swagger.response(401, description='Attempted access to other user profile (while not admin) or invalid JWT token')
    @jwt_required()
    def get(self):
        """
        Get the user profile by id
        Defaults to the current user id (by JWT)
        :return: The user profile in JSON format
        """
        current_user = get_jwt_identity()
        req_id = int(escape(request.args.get('id', current_user)))

        if current_user != req_id:
            logging.getLogger(__name__).warning(f'User {current_user} attempted to access user {request.args.get("id")}, not authorized')
            return {'status': 'error', 'message': "Not authorized"}, 401

        user = AUTH_SERVICE.get_user(user_id=req_id)
        if user is None:
            return {'status': 'error', 'message': "User not found"}, 404
        else:
            return user.to_json(), 200


    @swagger.tags('user_profile')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The user profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.parameter(_in='query', name='firstname', schema={'type': 'string'}, description='The new firstname')
    @swagger.parameter(_in='query', name='lastname', schema={'type': 'string'}, description='The new lastname')
    @swagger.response(200, description='Succesfully updated the user profile')
    @swagger.response(401, description='Attempted access to other user profile (while not admin) or invalid JWT token')
    @swagger.response(404, description='Unknown user id')
    @jwt_required()
    def put(self):
        """
        Update the user profile by id
        Defaults to the current user id (by JWT)
        Allowed parameters to update: firstname, lastname
        :return:
        """
        current_user = get_jwt_identity()
        req_id = int(escape(request.args.get('id', current_user)))

        if current_user != req_id:
            logging.getLogger(__name__).warning(f'User {current_user} attempted to access user {request.args.get("id")}, not authorized')
            return {'status': 'error', 'message': "Not authorized"}, 401

        # Get the user profile
        user = AUTH_SERVICE.get_user(user_id=req_id)
        if user is None:
            return {'status': 'error', 'message': "User not found"}, 404

        # Update the user
        copy = request.args.copy() # Create a copy of the request args as these are immutable
        user.update(clean_dict_input(copy))
        current_app.db.session.commit() # Save changes to db

        return {'status': 'success', 'message': 'User profile updated'}, 200



def attach_resource(app: Flask) -> None:
    """
    Attach the UserProfileResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_user_profile', __name__)
    api = Api(blueprint)
    api.add_resource(UserProfileResource, '/api/user_profile')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)


