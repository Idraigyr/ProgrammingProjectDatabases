from flask import request, Flask, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import Resource, swagger, Api

from src.model.user_settings import UserSettings
from src.resource import clean_dict_input, add_swagger, check_data_ownership
from src.schema import ErrorSchema
from src.swagger_patches import Schema, summary


class UserSettingsSchema(Schema):

    type = 'object'
    properties = {
        'player_id': {
            'type': 'integer',
            'description': 'The id of the player that these settings belong to'
        },
        'audio_volume': {
            'type': 'integer',
            'description': 'The audio volume of the player'
        },
        'sound_fx': {
            'type': 'boolean',
            'description': 'Whether sound effects are enabled'
        },
        'background_music': {
            'type': 'boolean',
            'description': 'Whether background music is enabled'
        },
        'move_fwd': {
            'type': 'string',
            'description': 'The keybind for moving forward'
        },
        'move_bkwd': {
            'type': 'string',
            'description': 'The keybind for moving backward'
        },
        'move_left': {
            'type': 'string',
            'description': 'The keybind for moving left'
        },
        'move_right': {
            'type': 'string',
            'description': 'The keybind for moving right'
        },
        'jump': {
            'type': 'string',
            'description': 'The keybind for jumping'
        },
        'inventory': {
            'type': 'string',
            'description': 'The keybind for opening the inventory'
        },
        'pause': {
            'type': 'string',
            'description': 'The keybind for pausing the game'
        },
        'attack': {
            'type': 'string',
            'description': 'The keybind for attacking'
        }
    }
    required = []

    title = 'UserSettings'
    description = 'A model representing the settings of a player'

    def __init__(self, user_settings: UserSettings = None, **kwargs):
        if user_settings is not None:  # user_settings -> schema
            super().__init__(player_id=user_settings.player_id, audio_volume=user_settings.audio_volume,
                             sound_fx=user_settings.sound_fx, background_music=user_settings.background_music,
                             move_fwd=user_settings.move_fwd, move_bkwd=user_settings.move_bkwd,
                             move_left=user_settings.move_left, move_right=user_settings.move_right,
                             jump=user_settings.jump, inventory=user_settings.inventory,
                             pause=user_settings.pause, attack=user_settings.attack, **kwargs)
        else:  # schema -> user_settings
            super().__init__(**kwargs)



class UserSettingsResource(Resource):

    @swagger.tags('settings')
    @summary('Get the settings of a player')
    @swagger.response(200, description='The settings of the player', schema=UserSettingsSchema)
    @swagger.response(404, description='The player does not exist', schema=ErrorSchema)
    @swagger.parameter(name='player_id', description='The id of the player to get the settings of', required=True, _in='query', schema={'type': 'integer'})
    @swagger.response(400, description='Player id absent', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Get the settings of a player
        :param player_id: The id of the player to get the settings of
        :return: The settings of the player
        """
        id = request.args.get('player_id', type=int)

        if id is None:
            return ErrorSchema('Player id absent'), 400

        user_settings = UserSettings.query.get(id)
        if user_settings is None:
            return ErrorSchema('The player does not exist'), 404

        return UserSettingsSchema(user_settings), 200

    @swagger.tags('settings')
    @summary('Update the settings of a player. All fields (except player_id) are updatable.')
    @swagger.response(200, description='Settings updated', schema=UserSettingsSchema)
    @swagger.response(404, description='The player does not exist', schema=ErrorSchema)
    @swagger.response(400, description='Player id absent', schema=ErrorSchema)
    @swagger.expected(UserSettingsSchema, required=True)
    @jwt_required()
    def put(self):
        """
        Update the settings of a player
        :return: The updated settings of the player
        """
        id = request.args.get('player_id', type=int)

        if id is None:
            return ErrorSchema('Player id absent'), 400

        user_settings = UserSettings.query.get(id)
        if user_settings is None:
            return ErrorSchema('The player does not exist'), 404

        try:
            data = request.get_json()
            data = clean_dict_input(data)

            UserSettingsSchema(**data, _check_requirements=False)

            data = request.get_json()
            data = clean_dict_input(data)

            r = check_data_ownership(
                user_settings.player_id)  # island_id == owner_id
            if r: return r

            user_settings.update(data)

            return UserSettingsSchema(user_settings), 200
        except ValueError as e:
            return str(e), 400


def attach_resource(app: Flask) -> None:
    """
    Attach the PlayerResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_settings', __name__)
    api = Api(blueprint)
    api.add_resource(UserSettingsResource, '/api/settings')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)



