from flask import request, Flask, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import Resource, swagger, Api

from src.resource import add_swagger
from src.resource.entity import EntitySchema
from src.schema import ErrorSchema
from src.swagger_patches import Schema
from src.model.island import Island
from src.swagger_patches import summary


class IslandSchema(Schema):
    """
    Schema for the Island model
    """
    type = 'object'
    properties = {
        'owner_id': {
            'type': 'integer',
            'description': 'The unique identifier of the island. This equals to the owner\'s user_profile_id'
        },
        'entities': {
            'type': 'array',
            'items': EntitySchema,
            'description': 'The entities on the island. This includes buildings, builder minions and other entities. The illustrated schema might be incomplete, refer to the type-sepcific schema for more information'
        }
    }
    required = []

    title = 'Island'
    description = 'A model representing an island in the game. Owned by a player with the same id'

    def __init__(self, island: Island = None, **kwargs):
        if island is not None: # island -> schema
            super().__init__(owner_id=island.owner_id,
                             entities=[self._resolve_schema_for_type(entity) for entity in island.entities])
        else: # schema -> island
            super().__init__(**kwargs)

    def _resolve_schema_for_type(self, entity: any):
        if entity.type == 'builder_minion':
            from src.resource.builder_minion import BuilderMinionSchema
            return BuilderMinionSchema(entity)

        raise ValueError(f'Cannot find Schema for unknown entity type {entity.type}')


class IslandResource(Resource):
    """
    A resource/api endpoint that allows for the retrieval and modification of islands
    More commonly the retrieval of entity sets, placable sets (buildings) and owner information.
    """

    @swagger.tags('island')
    @summary('Retrieve the island with the given id')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The island id to retrieve', required=True)
    @swagger.response(response_code=200, description='Successful retrieval', schema=IslandSchema)
    @swagger.response(response_code=404, description='Island not found', schema=ErrorSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the island with the given id in query parameter
        :return: The island in JSON format
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        island = Island.query.get(id)
        if island is None:
            return ErrorSchema(f'Island {id} not found'), 404


        return IslandSchema(island), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the IslandResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_island', __name__)
    api = Api(blueprint)
    api.add_resource(IslandResource, '/api/island')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)