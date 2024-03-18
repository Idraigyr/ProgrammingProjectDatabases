from typing import Optional

from flask import current_app, Blueprint, request, Flask
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api
from markupsafe import escape

from src.resource.gems import GemSchema
from src.swagger_patches import Schema, summary
from src.schema import ErrorSchema, SuccessSchema, IntArraySchema
from src.model.player import Player
from src.resource import add_swagger, clean_dict_input

"""
This module contains the PlayerResource, which is a resource/api endpoint that allows for the retrieval and modification of player profiles
The PlayerSchema is used to define the JSON response for the player profile, used in the PlayerResource
"""

class PlayerSchema(Schema):
    """
    The schema for the player profile requests & responses
    """
    type = 'object'
    properties = {
        'user_profile_id': {
            'type': 'integer'
        },
        'level': {
            'type': 'integer'
        },
        'crystals': {
            'type': 'integer'
        },
        'mana': {
            'type': 'integer'
        },
        'spells': IntArraySchema,
        'gems': {
            'type': 'array',
            'items': GemSchema
        }
    }

    required = [] # nothing is required, but not giving anything is just doing nothing

    def __init__(self, player: Player= None, **kwargs):
        if player is not None: # player -> schema
            super().__init__(user_profile_id=player.user_profile_id, level=player.level,
                             crystals=player.crystals, mana=player.mana,
                             spells=[spell.id for spell in player.spells],
                             gems=[GemSchema(gem) for gem in player.gems],
                             **kwargs)
        else: # schema -> player
            super().__init__(**kwargs)




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
    @summary('Get the player profile by id')
    @jwt_required()
    def get(self):
        """
        Get the player profile by id
        Defaults to the current user id (by JWT)
        :return: The player profile in JSON format
        """
        current_user_id = get_jwt_identity()

        target_user_id = int(escape(request.args.get('id', current_user_id)))

        player: Optional[Player] = Player.query.get(target_user_id)

        # Check if the target player exists
        if player is None:
            return ErrorSchema(f"Player {target_user_id} not found"), 404
        else:
            return PlayerSchema(player), 200

    @swagger.tags('player')
    @swagger.expected(PlayerSchema)
    @summary('Update the player profile by id')
    @swagger.response(200, description='Succesfully updated the player profile', schema=PlayerSchema)
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

        data = request.get_json()
        data = clean_dict_input(data)
        data['user_profile_id'] = user_id # overwritten unconditionally
        try:
            PlayerSchema(**data)  # Validate the input

            # Get the player profile
            player: Optional[Player] = Player.query.get(user_id)

            # Check if the target player exists
            if player is None:  # This should never happen, as the player is guaranteed to exist by the JWT
                return ErrorSchema(f"Player {user_id} not found"), 404

            # Update the player profile, might throw semantic errors as ValueError
            player.update(data)

            current_app.db.session.commit()  # Submit the changes to the database

            return PlayerSchema(player), 200
        except ValueError as e:
            return ErrorSchema(str(e)), 400



class PlayerListResource(Resource):
    """
    A PlayerList resource is a resource/api endpoint that allows for the retrieval of all player profiles
    """

    @swagger.tags('player')
    @summary('Get all player profiles')
    @swagger.response(200, description='Success, returns a list of all player profiles in JSON format', schema=PlayerSchema)
    @swagger.response(401, description='Invalid JWT token', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Get all player profiles
        :return: The player profiles in JSON format
        """
        players = Player.query.all()
        return [PlayerSchema(player) for player in players], 200


def attach_resource(app: Flask) -> None:
    """
    Attach the PlayerResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_player', __name__)
    api = Api(blueprint)
    api.add_resource(PlayerResource, '/api/player')
    api.add_resource(PlayerListResource, '/api/player/list')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)