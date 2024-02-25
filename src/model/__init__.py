from flask import Flask

def attach_resources(app: Flask, enable_swagger: bool) -> None:
    """
    Attach all resource endpoints to the app
    :param app: The app
    :param enable_swagger: Enable swagger documentation
    :return: None
    """
    # This will automatically create a RESTFUL API endpoint for each Resource
    import src.model.player as player_module
    player_module.attach_resource(app, enable_swagger=enable_swagger)