from flask import request, Flask, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api, Resource

from src.model.placeable.building import Building
from src.model.placeable.buildings import MineBuilding
from src.resource import add_swagger
from src.resource.placeable.building import BuildingSchema, BuildingResource
from src.schema import ErrorSchema
from src.swagger_patches import summary


class MineBuildingSchema(BuildingSchema):
    properties = {
        'mine_type': {
            'type': 'string',
            'description': 'The type of the mine'
        },
        'mined_amount': {
            'type': 'integer',
            'description': 'The amount the mine has mined since the last time it was emptied'
        }
    }

    required = []

    title = 'MineBuilding'
    description = 'A mine that mines a certain type of resource and keeps it until it is emptied by the player'

    def __init__(self, mine: MineBuilding = None, **kwargs):
        if mine is not None:
            super().__init__(mine, mine_type=mine.mine_type, mined_amount=mine.mined_amount)
        else:
            super().__init__(**kwargs)


class MineBuildingResource(Resource):
    """
    A resource / api endpoint that allows for the retrieval and modification of
    new and existing mines.
    """

    @swagger.tags('placeable')
    @summary("Retrieve a mine building by its placeable id")
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The mine building id to retrieve')
    @swagger.response(response_code=200, description="The altar building in JSON format", schema=MineBuildingSchema)
    @swagger.response(response_code=404, description='Builder minion not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the mine with the given placeable id
        The id is given as a query parameter
        :return:
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        mine = MineBuilding.query.get(id)
        if not mine:
            return ErrorSchema(f"Mine building {id} not found"), 404

        return MineBuildingSchema(mine), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the MineBuildingResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_mine_building', __name__)
    api = Api(blueprint)
    api.add_resource(MineBuildingResource, '/api/placeable/mine_building')
    app.register_blueprint(blueprint, url_prefix='/')  # Relative to api.add_resource path
    add_swagger(api)
