from flask import request, Blueprint, Flask, current_app
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api

from src.resource import add_swagger, clean_dict_input
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

    description = "A schema representing the Fuse table model. Note: removal of gems from a building is done through the gem endpoint by removing its association with this building"

    def __init__(self, fuse_table_building: FuseTableBuilding = None, **kwargs):
        if fuse_table_building:
            super().__init__(building=fuse_table_building, **kwargs)
        else:
            super().__init__(**kwargs)


class FuseTableBuildingResource(BuildingResource):
    """
    A resource/api endpoint that allows the retrieval and modification of a Fuse Table Building
    """

    @swagger.tags('building')
    @summary("Retrieve the fuse table building object with the given id")
    @swagger.parameter(_in='query', name='placeable_id', schema={'type': 'int'}, description='The builder minion id to retrieve', required=True)
    @swagger.response(response_code=200, description="The fuse table building in JSON format",
                      schema=FuseTableBuildingSchema)
    @swagger.response(response_code=404, description='Fuse table with given id not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the fuse table building with the given placeable id
        The placeable id is in the query parameter 'placeable_id'
        :return:
        """
        id = request.args.get('placeable_id', type=int)
        if id is None:
            return ErrorSchema('No placeable_id given'), 400

        fuse_table_building = FuseTableBuilding.query.get(id)
        if not fuse_table_building:
            return ErrorSchema(f'Fuse table with id {id} not found'), 404

        return FuseTableBuildingSchema(fuse_table_building), 200


    @swagger.tags('building')
    @summary("Update the fuse table building object with the given id")
    @swagger.expected(schema=FuseTableBuildingSchema, required=True)
    @swagger.response(response_code=200, description="The fuse table building has been updated. The up-to-date object is returned", schema=FuseTableBuildingSchema)
    @swagger.response(response_code=404, description='Fuse table with given id not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def put(self):
        """
        Update the fuse table building with the given placeable id
        :return:
        """
        # Get the JSON data from the request
        data = request.get_json()
        data = clean_dict_input(data)
        try:
            FuseTableBuildingSchema(**data, _check_requirements=False)
            id = int(data['placeable_id'])


            # Get the existing fuse table building
            fuse_table_building = FuseTableBuilding.query.get(id)
            if not fuse_table_building:
                return ErrorSchema(f'Fuse table with id {id} not found'), 404

            # Update the existing fuse table building
            fuse_table_building.update(data)

            current_app.db.session.commit()
            return FuseTableBuildingSchema(fuse_table_building), 200
        except (ValueError, KeyError) as e:
            return ErrorSchema(str(e)), 400


    @swagger.tags('building')
    @summary("Create a new fuse table building")
    @swagger.expected(schema=FuseTableBuildingSchema, required=True)
    @swagger.response(response_code=200, description="The fuse table building has been created. The new object is returned", schema=FuseTableBuildingSchema)
    @swagger.response(response_code=400, description='Invalid input', schema=ErrorSchema)
    @jwt_required()
    def post(self):
        """
        Create a new fuse table building
        :return:
        """
        # Get the JSON data from the request
        data = request.get_json()
        data = clean_dict_input(data)
        try:
            FuseTableBuildingSchema(**data, _check_requirements=True)

            # Create the tower model & add it to the database
            if 'placeable_id' in data:
                data.pop('placeable_id') # let SQLAlchemy initialize the id
            if 'blueprint' in data:
                data.pop('blueprint')

            # Create the new fuse table building
            fuse_table_building = FuseTableBuilding(**data)
            current_app.db.session.add(fuse_table_building)
            current_app.db.session.commit()
            return FuseTableBuildingSchema(fuse_table_building), 200

        except ValueError as e:
            return ErrorSchema(str(e)), 400



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