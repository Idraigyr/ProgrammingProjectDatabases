from src.model.placeable.building import Building
from src.resource.placeable.placeable import PlaceableSchema, PlaceableResource


class BuildingSchema(PlaceableSchema):
    """
    Schema for building model
    This is only a base schema and should be subclassed for specific entity types
    """

    properties = {
        'level': {
            'type': 'integer',
            'description': 'Level of the building'
        }
    }

    required_properties = []

    title = 'Building'
    description = 'A model representing a building in the game.'

    def __init__(self, building: Building = None, **kwargs):
        if building is not None:
            super().__init__(building, level=building.level)
        else:
            super().__init__(**kwargs)


class BuildingResource(PlaceableResource):
    """
    Resource for buildings.

    This class has no functionality as the Building model is a pure abstrat class.
    Modifications and retrieval of buildings is done through their respective subclass API endpoints.

    Listing of buildings is done through the IslandResource.
    """
    pass
