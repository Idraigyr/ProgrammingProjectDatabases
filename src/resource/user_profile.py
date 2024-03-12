import logging

from flask import Flask, Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api
from markupsafe import escape

from src.schema import ErrorSchema, SuccessSchema
from src.resource import add_swagger, clean_dict_input
from src.service.auth_service import AUTH_SERVICE
from src.swagger_patches import Schema, summary


class UserProfileSchema(Schema):
    """
    The schema for the user profile response
    """
    type = 'object'
    properties = {
        'id': {
            'type': 'integer'
        },
        'username': {
            'type': 'string'
        },
        'firstname': {
            'type': 'string'
        },
        'lastname': {
            'type': 'string'
        },
        'admin': {
            'type': 'bool'
        }
    }

    required = ['id', 'username', 'firstname', 'lastname', 'admin']

    def __init__(self, user):
        super().__init__(id=user.id, username=user.username, firstname=user.firstname, lastname=user.lastname, admin=user.admin)



class UserProfileResource(Resource):
    """
    A UserProfile resource is a resource/api endpoint that allows for the retrieval and modification of user profiles

    This resource is protected by JWT, and requires a valid JWT token to access
    """

    @swagger.tags('user_profile')
    @summary('Retrieve the user profile with the given id')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The user profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.response(200, description='Success, returns the user profile in JSON format', schema=UserProfileSchema)
    @swagger.response(401, description='Attempted access to other user profile (while not admin) or invalid JWT token', schema=ErrorSchema)
    @swagger.response(404, description='Unknown user id', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Get the user profile by id
        Defaults to the current user id (by JWT)
        :return: The user profile in JSON format
        """
        current_user = get_jwt_identity()
        target_user_id = int(escape(request.args.get('id', current_user)))
        invoker_user = AUTH_SERVICE.get_user(user_id=current_user)

        if not invoker_user or (current_user != target_user_id and not invoker_user.admin):
            logging.getLogger(__name__).warning(f'User {current_user} attempted to access user {request.args.get("id")}, not authorized')
            return ErrorSchema(f"Access denied to profile {target_user_id}"), 401

        # Get the user profile
        if target_user_id != current_user:
            # users differ, so we're going to get the profile of the requested user
            target_user = AUTH_SERVICE.get_user(user_id=target_user_id)
        else:
            # The invoker is modifying his own profile
            target_user = invoker_user


        if target_user is None:
            return ErrorSchema(f"User {target_user_id} not found"), 404
        else:
            return UserProfileSchema(target_user), 200


    @swagger.tags('user_profile')
    @summary('Update the user profile by id')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The user profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.parameter(_in='query', name='firstname', schema={'type': 'string'}, description='The new firstname')
    @swagger.parameter(_in='query', name='lastname', schema={'type': 'string'}, description='The new lastname')
    @swagger.parameter(_in='query', name='admin', schema={'type': 'bool'}, description='The new admin status (only allowed if current user is admin)')
    @swagger.response(200, description='Succesfully updated the user profile', schema=SuccessSchema)
    @swagger.response(401, description='Attempted access to other user profile (while not admin), attempt to set the admin property (while not admin) or invalid JWT token', schema=ErrorSchema)
    @swagger.response(404, description='Unknown user id', schema=ErrorSchema)
    @jwt_required()
    def put(self):
        """
        Update the user profile by id
        Defaults to the current user id (by JWT)
        Allowed parameters to update: firstname, lastname
        :return:
        """
        current_user = get_jwt_identity()
        target_user_id = int(escape(request.args.get('id', current_user)))
        invoker_user = AUTH_SERVICE.get_user(user_id=current_user)

        if not invoker_user or (current_user != target_user_id and not invoker_user.admin):
            logging.getLogger(__name__).warning(f'User {current_user} attempted to access user {request.args.get("id")}, not authorized')
            return ErrorSchema(f"Access denied to profile {target_user_id}"), 401

        # Get the user profile
        if target_user_id != current_user:
            # users differ, so we're going to get the profile of the requested user
            target_user = AUTH_SERVICE.get_user(user_id=target_user_id)
        else:
            # The invoker is modifying his own profile
            target_user = invoker_user


        if target_user is None:
            return ErrorSchema(f"User {target_user_id} not found"), 404

        # Update the user
        copy = request.args.copy() # Create a copy of the request args as these are immutable

        if 'admin' in copy:
            # Check if the current user is an admin, otherwise he's not allowed to change the admin bit
            # (a creative user would be able to give himself admin, so we need to check this)
            if not invoker_user.admin:
                return ErrorSchema(f"Access denied to set admin status for profile {target_user_id}"), 401

        target_user.update(clean_dict_input(copy))
        current_app.db.session.commit() # Save changes to db

        return SuccessSchema(f"User {target_user_id} updated"), 200



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


