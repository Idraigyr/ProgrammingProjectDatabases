from flask import request, Flask, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api

from src.model.placeable.buildings import WarriorHutBuilding
from src.resource import add_swagger
from src.resource.placeable.building import BuildingSchema, BuildingResource
from src.schema import ErrorSchema
from src.swagger_patches import summary


class WarriorHutBuildingSchema(BuildingSchema):
    """
    The JSON schema for Warrior Hut Building representation
    Please refer to the Swagger documentation for the complete schema (due to inheritance)
    """

    properties = {}

    required = []

    title = "Warrior hut"
    description = "A schema representing the Warrior hut model"

    def __init__(self, warrior_hut_building: WarriorHutBuilding = None, **kwargs):
        if warrior_hut_building:
            super().__init__(warrior_hut_building)
        else:
            super().__init__(**kwargs)


class WarriorHutBuildingResource(BuildingResource):
    """
    A resource/api endpoint that allows the retrieval and modification of a Warrior Hut Buildings
    """

    @swagger.tags('building')
    @summary("Retrieve the warrior hut building object with the given id")
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The warrior hut id to retrieve')
    @swagger.response(response_code=200, description="The warrior hut building in JSON format", schema=WarriorHutBuildingSchema)
    @swagger.response(response_code=404, description='Warrior hut with given id not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the warrior hut building with the given placeable id
        The id is given as a query parameter
        :return:
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        warrior_hut_building = WarriorHutBuilding.query.get(id)
        if not warrior_hut_building:
            return ErrorSchema(f'Warrior hut with id {id} not found'), 404

        return WarriorHutBuildingSchema(warrior_hut_building), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the MineBuildingResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('warrior_hut_api', __name__)
    api = Api(blueprint)
    api.add_resource(WarriorHutBuildingResource, '/api/placeable/warrior_hut')
    app.register_blueprint(blueprint, url_prefix='/')  # Relative to api.add_resource path
    add_swagger(api)
