from flask import request, Blueprint, Flask
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api

from src.resource import add_swagger
from src.model.placeable.buildings import FuseTableBuilding
from src.resource.placeable.building import BuildingResource, BuildingSchema
from src.schema import ErrorSchema
from src.swagger_patches import summary


class FuseTableBuildingSchema(BuildingSchema):
    """
    The JSON schema for Fuse Table Building representation
    Please refer to the Swagger documentation for the complete schema (due to inheritance)
    """

    properties = {}
    required = []
    title = "Fuse table"

    description = "A schema representing the Fuse table model"

    def __init__(self, fuse_table_building: FuseTableBuilding = None, **kwargs):
        if fuse_table_building:
            super().__init__(fuse_table_building)
        else:
            super().__init__(**kwargs)


class FuseTableBuildingResource(BuildingResource):
    """
    A resource/api endpoint that allows the retrieval and modification of an Fuse Table Building
    """

    @swagger.tags('building')
    @summary("Retrieve the fuse table building object with the given id")
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The builder minion id to retrieve')
    @swagger.response(response_code=200, description="The fuse table building in JSON format",
                      schema=FuseTableBuildingSchema)
    @swagger.response(response_code=404, description='Fuse table with given id not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the fuse table building with the given placeable id

        :return:
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        fuse_table_building = FuseTableBuilding.query.get(id)
        if not fuse_table_building:
            return ErrorSchema(f'Fuse table with id {id} not found'), 404

        return FuseTableBuildingSchema(fuse_table_building), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the FuseTableBuildingResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('fuse_table_api', __name__)
    api = Api(blueprint)
    api.add_resource(FuseTableBuildingResource, '/api/placeable/fuse_table')
    app.register_blueprint(blueprint, url_prefix='/')  # Relative to api.add_resource path
    add_swagger(api)