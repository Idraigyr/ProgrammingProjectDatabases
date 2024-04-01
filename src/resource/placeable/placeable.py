from flask_restful_swagger_3 import Resource

from src.resource.blueprint import BlueprintSchema
from src.model.placeable.placeable import Placeable
from src.swagger_patches import Schema

class PlaceableSchema(Schema):
    """
    Schema for Placeable model
    This is only a base schema and should be subclassed for specific building types
    """
    _abstract_class = True

    type = 'object'
    properties = {
        'placeable_id': {
            'type': 'integer',
            'description': 'The unique id of the placeable'
        },
        'island_id': {
            'type': 'integer',
            'description': 'The unique identifier of the island that the placeable is build on'
        },
        'x': {
            'type': 'integer',
            'description': 'The x coordinate of the placeable, inside the grid'
        },
        'z': {
            'type': 'integer',
            'description': 'The z coordinate of the placeable, inside the grid'
        },
        'rotation': {
            'type': 'integer',
            'description': 'The rotation of the placeable. 0=North, 1=East, 2=South, 3=West'
        },
        'type': {
            'type': 'string',
            'description': 'The type of this placeable'
        },
        'blueprint': {
            'type': 'object',
            'items': BlueprintSchema,
        }
    }

    required = ['island_id', 'x', 'z', 'rotation']

    title = 'Placeable'
    description = 'A model representing a building in the game. A placeable can only be moved with respect to the grid of the island'

    def __init__(self, placeable: Placeable = None, **kwargs):
        if placeable is not None:
            super().__init__(placeable_id=placeable.placeable_id,
                             island_id=placeable.island_id,
                             x=placeable.xpos,
                             z=placeable.zpos,
                             type=placeable.type,
                             blueprint=BlueprintSchema(placeable.blueprint),
                             rotation=placeable.rotation,
                             **kwargs)
        else:
            super().__init__(**kwargs)


class PlaceableResource(Resource):
    """
    A resource/api endpoint that allows for the retrieval and modification of placables
    More commonly the retrieval of placable sets on the grid of an island

    This class has no functionality as the Placeable Model is a pure abstract class.
    Modifications and retrieval of placables are done through their respective subclass API endpoints.

    Listing of placables is done through the IslandResource
    """