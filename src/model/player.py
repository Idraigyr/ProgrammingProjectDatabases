from flask import current_app, Blueprint, request, Flask
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful_swagger_3 import Resource, swagger, Api, get_swagger_blueprint
from markupsafe import escape
from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship


class Player(current_app.db.Model):
    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="player", single_parent=True)

    xp: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)
    crystals: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)

    def __init__(self, user_profile=None, xp: int=0, crystals: int=0):
        self.user_profile = user_profile
        self.xp = xp
        self.crystals = crystals

    def to_json(self):
        return {
            'user_profile_id': self.user_profile_id,
            'xp': self.xp,
            'crystals': self.crystals
        }



class PlayerResource(Resource):
    """
    A Player resource is a resource/api endpoint that allows for the retrieval and modification of player profiles

    This resource is protected by JWT, and requires a valid JWT token to access
    """
    @swagger.tags('player')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The player profile id to retrieve. Defaults to the current user id (by JWT)')
    @swagger.response(200, description='Success, returns the player profile in JSON format')
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

        result: Player or None = current_app.db.session.query(Player).filter(Player.user_profile_id == id).first()
        if result is None:
            return {'status': 'error', 'message': 'Player not found'}, 404
        else:
            return result, 200

    @swagger.tags('player')
    @swagger.response(200, description='Update the player profile')
    @swagger.response(401, description='Unauthorized')
    @jwt_required()
    def put(self):
        return {}, 501


def attach_resource(app: Flask, enable_swagger: bool) -> None:
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

    if enable_swagger:
        swagger_url = app.config.get('APP_SWAGGER_URL', '/api/docs')
        api_url = app.config.get('APP_SWAGGER_API_URL', '/static/swagger.json')
        resource = get_swagger_blueprint(api.open_api_object, add_api_spec_resource=enable_swagger,
                                                    swagger_url=swagger_url, swagger_prefix_url=api_url,
                                                    title=app.config['APP_NAME'])
        app.register_blueprint(resource, url_prefix=swagger_url)