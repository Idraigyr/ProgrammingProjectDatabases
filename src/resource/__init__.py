from flask import Flask
from flask_restful_swagger_3 import Api
from markupsafe import escape
from deepmerge import always_merger

openapi_dict = dict()

def add_swagger(api: Api) -> None:
    """
    Add swagger documentation to the global openapi_dict
    This is a hack because the flask_restful_swagger_3 library does not work with multiple blueprints
    So we merge the swagger openapi dictionary from each blueprint into a single dictionary
    :param api: The api object with the swagger documentation (in json)
    :return: None
    """
    # Add swagger documentation by deep-merging it into the openAPI object
    global openapi_dict
    always_merger.merge(openapi_dict, api.open_api_object)

def add_endpoint_to_swagger(path: str, method: str or list[str], tags: list, summary: str, description: str, parameters: list[dict], response_schemas: dict) -> None:
    """
    Add an endpoint to the global openapi_dict
    :param path: The path of the endpoint
    :param method: The method(s) of the endpoint
    :param tags: The tags of the endpoint
    :param summary: The summary of the endpoint
    :param description: The description of the endpoint
    :param parameters: The parameters of the endpoint
    :param response_schemas: The response schemas of the endpoint, mapped by status code
    :return: None
    """
    global openapi_dict
    if 'paths' not in openapi_dict:
        openapi_dict['paths'] = dict()
    if path not in openapi_dict['paths']:
        openapi_dict['paths'][path] = dict()

    methods = method if isinstance(method, list) else [method]
    for method in methods:
        openapi_dict['paths'][path][method] = {
            "tags": tags,
            "summary": summary,
            "description": description,
            "parameters": parameters,

        }

        openapi_dict['paths'][path][method]['responses'] = dict()
        for status_code, response_schema in response_schemas.items():
            openapi_dict['paths'][path][method]['responses'][status_code] = {
                "description": response_schema['description'],
                "content": {
                    "application/json": {
                        "schema": response_schema['schema']
                    }
                }
            }


def attach_resources(app: Flask) -> None:
    """
    Attach all resource endpoints to the app
    :param app: The Flask app to register the endpoints to
    :return: None
    """
    # This will automatically create a RESTFUL API endpoint for each Resource
    import src.resource.player as player_module
    import src.resource.user_profile as user_profile_module
    import src.resource.spell as spell_module
    import src.resource.island as island_module
    import src.resource.builder_minion as builder_minion_module
    import src.resource.placeable.mine_building as mine_building_module
    import src.resource.placeable.altar_building as altar_building_module
    import src.resource.placeable.fuse_table_building as fuse_table_building_module
    import src.resource.placeable.warrior_hut_building as warrior_hut_building_module
    import src.resource.placeable.tower_building as tower_building_module
    import src.resource.gems as gems_module

    player_module.attach_resource(app)
    user_profile_module.attach_resource(app)
    spell_module.attach_resource(app)
    island_module.attach_resource(app)
    builder_minion_module.attach_resource(app)
    mine_building_module.attach_resource(app)
    altar_building_module.attach_resource(app)
    fuse_table_building_module.attach_resource(app)
    warrior_hut_building_module.attach_resource(app)
    tower_building_module.attach_resource(app)
    gems_module.attach_resource(app)


def clean_dict_input(d: dict) -> dict:
    """
    Clean the input dictionary by calling escape() on each value
    :param d: The input dictionary
    :return: The cleaned dictionary
    """
    for key, val in d.items():
        if isinstance(val, str):
            d[str(escape(key))] = str(escape(val))
        elif isinstance(val, dict): # recursive call
            d[escape(key)] = clean_dict_input(val)

    return d
