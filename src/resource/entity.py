from flask_restful_swagger_3 import Resource

from src.model.entity import Entity
from src.swagger_patches import Schema

class EntitySchema(Schema):
    """
    Schema for the Entity model.
    This is only a base schema and should be subclassed for specific entity types.
    """
    _abstract_class = True

    type = 'object'
    properties = {
        'entity_id': {
            'type': 'integer',
            'description': 'The unique identifier of the entity'
        },
        'island_id': {
            'type': 'integer',
            'description': 'The unique identifier of the island that the entity is on'
        },
        'x': {
            'type': 'integer',
            'description': 'The x coordinate of the entity'
        },
        'z': {
            'type': 'integer',
            'description': 'The z coordinate of the entity'
        },
        'type': {
            'type': 'string',
            'description': 'The type of the entity'
        }
    }
    required = ['island_id']

    title = 'Entity'
    description = 'A model representing an entity in the game. An entity is a movable object that can moved without dependence on the grid of an island'

    def __init__(self, entity: Entity = None, **kwargs):
        if entity is not None:  # entity -> schema
            super().__init__(entity_id=entity.entity_id, x=entity.xpos, z=entity.zpos, type=entity.type,
                             island_id=entity.island_id, **kwargs)
        else:  # schema -> entity
            super().__init__(**kwargs)


class EntityResource(Resource):
    """
    A resource/api endpoint that allows for the retrieval and modification of entities
    More commonly the retrieval of entity sets, placable sets (buildings) and owner information.

    This class has no functionality as the Entity Model is a pure abstract class.
    Modifications and retrieval of entites is done through their respective subclass API endpoints.

    Listing of entities is done through the IslandResource.
    """
    pass