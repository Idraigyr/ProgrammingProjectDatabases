from flask import request, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api

from src.model.placeable.buildings import TowerBuilding
from src.resource import add_swagger
from src.resource.placeable.building import BuildingSchema, BuildingResource
from src.schema import ErrorSchema
from src.swagger_patches import summary


class TowerBuildingSchema(BuildingSchema):
    """
    The JSON schema for TowerBuilding representation
    Please refer to the Swagger documentation for the complete schema (due to inheritance)
    """

    properties = {
        'tower_type': {
            'type': 'string',
            'description': 'The type of the tower'
        }
    }

    required = []

    title = 'TowerBuilding'
    description = 'A tower that shoots at enemy warior minions in multiplayer mode'

    def __init__(self, tower_building: TowerBuilding = None, **kwargs):
        if tower_building is not None:
            super().__init__(tower_building, tower_type=tower_building.tower_type)
        else:
            super().__init__(**kwargs)


class TowerBuildingResource(BuildingResource):
    """
    A resource / api endpoint that allows for the retrieval and modification of new and existing towers.
    """

    @swagger.tags('building')
    @summary("Retrieve a tower building by its placeable id")
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The tower building id to retrieve')
    @swagger.response(response_code=200, description="The tower building in JSON format", schema=TowerBuildingSchema)
    @swagger.response(response_code=404, description='Tower building not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the tower with the given placeable id
        The id is given as a query parameter
        :return:
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        tower = TowerBuilding.query.get(id)
        if not tower:
            return ErrorSchema(f"Tower building {id} not found"), 404

        return TowerBuildingSchema(tower), 200


def attach_resource(app) -> None:
    """
    Attach the TowerBuildingResource (API endpoint + Swagger docs) to the given Flask app
    :param app:  The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('tower_building_api', __name__)
    api = Api(blueprint)
    api.add_resource(TowerBuildingResource, '/api/placeable/tower_building')
    app.register_blueprint(blueprint, url_prefix='/')  # Relative to api.add_resource path
    add_swagger(api)
