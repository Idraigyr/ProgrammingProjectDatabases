from typing import Optional

from flask import current_app, Blueprint, request, Flask
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api
from markupsafe import escape

from src.model.player import Player
from src.resource import add_swagger, clean_dict_input


class PlayerResource(Resource):
    """
    A Player resource is a resource/api endpoint that allows for the retrieval and modification of player profiles

    This resource is protected by JWT, and requires a valid JWT token to access
    """

    @swagger.tags('player')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The player profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.response(200, description='Success, returns the player profile in JSON format')
    @swagger.response(404, description='Unknown player id')
    @swagger.response(401, description='Attempted access to other user profile (while not admin) or invalid JWT token')
    @jwt_required()
    def get(self):
        """
        Get the player profile by id
        Defaults to the current user id (by JWT)
        :return: The player profile in JSON format
        """
        user_id = get_jwt_identity()

        id = int(escape(request.args.get('id', user_id)))

        player: Optional[Player] = current_app.db.session.query(Player).filter(Player.user_profile_id == id).first()
        if player is None:
            return {'status': 'error', 'message': 'Player not found'}, 404
        else:
            return player, 200

    @swagger.tags('player')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The player profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.parameter(_in='query', name='xp', schema={'type': 'int'}, description='The new XP value')
    @swagger.parameter(_in='query', name='crystals', schema={'type': 'int'}, description='The new crystals value')
    @swagger.response(200, description='Succesfully updated the player profile')
    @swagger.response(404, description='Unknown player id')
    @swagger.response(401, description='Attempted access to other user profile (while not admin) or invalid JWT token')
    @jwt_required()
    def put(self):
        """
        Update the player profile by id
        Defaults to the current user id (by JWT)
        :return: The player profile in JSON format
        """
        user_id = get_jwt_identity()
        id = int(escape(request.args.get('id', user_id)))

        # Get the player profile
        player: Optional[Player] = current_app.db.session.query(Player).filter(Player.user_profile_id == id).first()
        if player is None:
            return {'status': 'error', 'message': 'Player not found'}, 404

        # Update the player profile
        copy = request.args.copy() # Create a copy of the request args as these are immutable
        player.update(clean_dict_input(copy))
        result = current_app.db.session.commit() # Submit the changes to the database


        return {'status': 'success', 'message': 'Player profile updated'}, 200


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