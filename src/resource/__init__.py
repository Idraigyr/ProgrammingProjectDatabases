from flask import Flask
from flask_restful_swagger_3 import Api
from markupsafe import escape

openapi_dict = dict()

def add_swagger(api: Api) -> None:
    """
    Add swagger documentation to the global openapi_dict
    This is a hack because the flask_restful_swagger_3 library does not work with multiple blueprints
    So we merge the swagger openapi dictionary from each blueprint into a single dictionary
    :param api: The api object with the swagger documentation (in json)
    :return: None
    """
    # Add swagger documentation
    global openapi_dict
    map = api.open_api_object
    if 'paths' not in openapi_dict: # emtpy dict, init it with the first map
        openapi_dict = map
    else: # Merge paths and tags
        openapi_dict['paths'] = openapi_dict['paths'] | map['paths'] # dict
        openapi_dict['tags'] = openapi_dict['tags'] + map['tags'] # list


def attach_resources(app: Flask) -> None:
    """
    Attach all resource endpoints to the app
    :param app: The Flask app to register the endpoints to
    :return: None
    """
    # This will automatically create a RESTFUL API endpoint for each Resource
    import src.resource.player as player_module
    import src.resource.user_profile as user_profile_module
    player_module.attach_resource(app)
    user_profile_module.attach_resource(app)


def clean_dict_input(d: dict) -> dict:
    """
    Clean the input dictionary by calling escape() on each value
    :param d: The input dictionary
    :return: The cleaned dictionary
    """
    for key, val in d.items():
        d[escape(key)] = escape(val)
    return d
