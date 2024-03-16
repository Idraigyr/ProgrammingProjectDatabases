from flask import request, current_app, Flask, Blueprint
from flask_jwt_extended import jwt_required
from flask_restful_swagger_3 import swagger, Api

from src.model.builder_minion import BuilderMinion
from src.resource import clean_dict_input, add_swagger
from src.resource.entity import EntitySchema, EntityResource
from src.schema import ErrorSchema, SuccessSchema
from src.swagger_patches import summary


class BuilderMinionSchema(EntitySchema):
    """
    The JSON schema for Builder Minion representation
    Please refer to the Swagger documentation for the complete schema (due to inheritance)
    """

    properties = {
        'level': {
            'type': 'integer',
            'description': 'The level of the builder minion'
        }
    }

    required = []

    title = 'BuilderMinion'
    description = 'A model representing a builder minion in the game. A builder minion is a type of entity that can move on an island and can build buildings.'

    def __init__(self, builder_minion: BuilderMinion = None, **kwargs):
        if builder_minion is not None:
            super().__init__(builder_minion, level=builder_minion.level)
        else:
            super().__init__(**kwargs)


class BuilderMinionResource(EntityResource):
    """
    A resource/api endpoint that allows for the retrieval and modification of builder minions
    """

    @swagger.tags('entity')
    @summary('Retrieve the builder minion with the given id')
    @swagger.parameter(_in='query', name='id', schema={'type': 'int'}, description='The builder minion id to retrieve')
    @swagger.response(response_code=200, description='Successful retrieval', schema=BuilderMinionSchema)
    @swagger.response(response_code=400, description='No id given', schema=ErrorSchema)
    @swagger.response(response_code=404, description='Builder minion not found', schema=ErrorSchema)
    @jwt_required()
    def get(self):
        """
        Retrieve the builder minion with the given id
        The id of the builder minion to retrieve is given as a query parameter
        :return: The builder minion in JSON format
        """
        id = request.args.get('id', type=int)
        if id is None:
            return ErrorSchema('No id given'), 400

        builder_minion = BuilderMinion.query.get(id)
        if builder_minion is None:
            return ErrorSchema(f'Builder minion {id} not found'), 404

        return BuilderMinionSchema(builder_minion), 200


    @swagger.tags('entity')
    @summary('Create a new builder minion')
    @swagger.expected(schema=BuilderMinionSchema, required=True)
    @swagger.response(response_code=200, description='Builder minion created', schema=SuccessSchema)
    @swagger.response(response_code=400, description='Invalid input', schema=ErrorSchema)
    @jwt_required()
    def post(self):
        """
        Create a new builder minion
        :return: The success message, or an error message
        """
        # Get the JSON input
        data = request.get_json()
        data = clean_dict_input(data)

        try:
            BuilderMinionSchema(**data)  # Validate the input
        except ValueError as e:
            return ErrorSchema(str(e)), 400

        # Create the BuilderMinion model & add it to the database
        if 'entity_id' in data:
            data.pop('entity_id') # let SQLAlchemy initialize the id

        builder_minion = BuilderMinion(**data)

        current_app.db.session.add(builder_minion)
        current_app.db.session.commit()
        return SuccessSchema(f'Builder minion {builder_minion.entity_id} created'), 200

    @swagger.tags('entity')
    @summary('Update an existing builder minion')
    @swagger.expected(schema=BuilderMinionSchema, required=True)
    @swagger.response(200, description='Builder minion successfully updated', schema=SuccessSchema)
    @swagger.response(404, description="Builder minion not found", schema=ErrorSchema)
    @swagger.response(400, description="Invalid input", schema=ErrorSchema)
    @jwt_required()
    def put(self):
        """
        Update a builder minion by its id (from query)
        :return:
        """
        data = request.get_json()
        data = clean_dict_input(data)

        try:
            BuilderMinionSchema(**data)
            id = int(data['entity_id'])
        except (ValueError, KeyError) as e:
            return ErrorSchema(str(e)), 400

        minion = BuilderMinion.query.get(id)
        if minion is None:
            return ErrorSchema(f"Builder minion with id {id} not found"), 404

        minion.update(data)

        current_app.db.session.commit()
        return SuccessSchema(f"Updated builder minion {id}"), 200


def attach_resource(app: Flask) -> None:
    """
    Attach the BuilderMinionResource (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_builder_minion', __name__)
    api = Api(blueprint)
    api.add_resource(BuilderMinionResource, '/api/entity/builder_minion')
    app.register_blueprint(blueprint, url_prefix='/')  # Relative to api.add_resource path
    add_swagger(api)