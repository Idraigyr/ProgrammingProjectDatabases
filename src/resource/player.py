from typing import Optional

from flask import current_app, Blueprint, request, Flask
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api, Schema
from markupsafe import escape

from src.schema import ErrorSchema, SuccessSchema
from src.model.player import Player
from src.resource import add_swagger, clean_dict_input

"""
This module contains the PlayerResource, which is a resource/api endpoint that allows for the retrieval and modification of player profiles
The PlayerSchema is used to define the JSON response for the player profile, used in the PlayerResource
"""

class PlayerSchema(Schema):
    """
    The schema for the player profile response
    """
    type = 'object'
    properties = {
        'user_profile_id': {
            'type': 'int'
        },
        'level': {
            'type': 'int'
        },
        'crystals': {
            'type': 'int'
        },
        'mana': {
            'type': 'int'
        }
    }

    required = ['user_profile_id', 'level', 'crystals', 'mana']

    def __init__(self, player: Player):
        super().__init__(user_profile_id=player.user_profile_id, level=player.level,
                         crystals=player.crystals, mana=player.mana)


class PlayerResource(Resource):
    """
    A Player resource is a resource/api endpoint that allows for the retrieval and modification of player profiles

    This resource is protected by JWT, and requires a valid JWT token to access
    """

    @swagger.tags('player')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The player profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.response(200, description='Success, returns the player profile in JSON format', schema=PlayerSchema)
    @swagger.response(404, description='Unknown player id', schema=ErrorSchema)
    @swagger.response(401, description='Invalid JWT token', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Get the player profile by id
        Defaults to the current user id (by JWT)
        :return: The player profile in JSON format
        """
        current_user_id = get_jwt_identity()

        target_user_id = int(escape(request.args.get('id', current_user_id)))

        player: Optional[Player] = current_app.db.session.query(Player).filter(Player.user_profile_id == target_user_id).first()

        # Check if the target player exists
        if player is None:
            return ErrorSchema(f"Player {target_user_id} not found"), 404
        else:
            return PlayerSchema(player), 200

    @swagger.tags('player')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The player profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.parameter(_in='query', name='level', schema={'type': 'int'}, description='The new level')
    @swagger.parameter(_in='query', name='mana', schema={'type': 'int'}, description='The new mana amount')
    @swagger.parameter(_in='query', name='crystals', schema={'type': 'int'}, description='The new crystals value')
    @swagger.response(200, description='Succesfully updated the player profile', schema=SuccessSchema)
    @swagger.response(404, description='Unknown player id', schema=ErrorSchema)
    @swagger.response(401, description='Caller is not owner of the given id or invalid JWT token', schema=ErrorSchema)
    @jwt_required()
    def put(self):
        """
        Update the player profile by id
        Defaults to the current user id (by JWT)
        :return: The player profile in JSON format
        """
        user_id = get_jwt_identity()
        target_user_id = int(escape(request.args.get('id', user_id)))
        if user_id != target_user_id:
            return ErrorSchema(f"Access denied to profile {target_user_id}"), 401

        # Get the player profile
        player: Optional[Player] = current_app.db.session.query(Player).filter(Player.user_profile_id == target_user_id).first()

        # Check if the target player exists
        if player is None:
            return ErrorSchema(f"Player {target_user_id} not found"), 404

        # Update the player profile
        copy = request.args.copy() # Create a copy of the request args as these are immutable
        player.update(clean_dict_input(copy))
        current_app.db.session.commit() # Submit the changes to the database

        return SuccessSchema("Player profile updated"), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the PlayerResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :param enable_swagger: True to enable Swagger documentation, False otherwise
    :return: None
    """
    blueprint = Blueprint('api_player', __name__)
    api = Api(blueprint)
    api.add_resource(PlayerResource, '/api/player')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)