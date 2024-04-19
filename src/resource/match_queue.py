from flask import request

from src.resource.player import PlayerSchema
from src.schema import ErrorSchema
from asyncio import Queue

from flask import Flask, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.model.player import Player
from typing import Optional
from markupsafe import escape
from flask_restful_swagger_3 import Resource, swagger, Api

from src.resource import add_swagger
from src.swagger_patches import Schema, summary

max_level = 10 #TODO: move this somewhere else / make it based on what's in db
level_range = 1 #range of levels (+&-) to look for a match

#dict of queues, each queue is a list of player ids per level
#TODO: change queue class to be not async
match_queue = dict()
for i in range(max_level + 1):
    match_queue[i] = Queue()


class MatchQueueSchema(Schema):
    """
    The schema for the endpoint's requests & responses
    """

    properties = {
        'message': {
            'type': 'string',
            'description': 'A message indicating the result of the matchmaking request'
        }
    }

    required = []
    type = 'object'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class MatchQueueResource(Resource):

    @swagger.tags('match queue')
    @summary(
        'join the matchmaking queue for multiplayer')
    @swagger.expected(schema=MatchQueueSchema, required=True)
    @swagger.response(200, 'Success', schema=MatchQueueSchema)
    @swagger.response(404, 'match queue not found', schema=ErrorSchema)
    @swagger.response(422, 'Invalid input', schema=ErrorSchema)
    @jwt_required()
    def put(self):
        """
        add player to the matchmaking queue and test whether 2 players can be matched, send a message to the matched players via websocket
        """

        current_user_id = get_jwt_identity()

        target_user_id = int(escape(request.args.get('id', current_user_id)))

        player: Optional[Player] = Player.query.get(target_user_id)

        player_data = PlayerSchema(player)

        player_level = int(player_data['entity']['level'])
        player_id = int(player_data['entity']['player_id'])

        # Check if the target player exists
        if player is None:
            return ErrorSchema(f"Player {target_user_id} not found"), 404
        else:
            # add player to the queue
            match_queue[player_level].put(player_id)

            #TODO: implement matchmaking logic
            #OPTION1: when 2 players are in the same queue, go to FINALISE
            if(match_queue[player_level].qsize() >= 2):
                #match them, remove them and send info via websocket
                player1 = match_queue[player_level].get()
                player2 = match_queue[player_level].get()
                #...
                return MatchQueueSchema(), 200
            #OPTION2: when 2 players are in different queues but still within a certain level range,
            count = 0
            for i in range(player_level - level_range, player_level + level_range):
                if i < 0 or i > max_level:
                    continue
                count += match_queue[i].qsize()
            if(count >= 2):
                # wait a certain amount of time to see if a new player will join one of their queues: if so go to OPTION1 else FINALISE
                # return MatchQueueSchema(), 200
                return ErrorSchema(f"can not yet match against players not of the same level"), 422
            else:
                return MatchQueueSchema(), 200




def attach_resource(app: Flask) -> None:
    """
    Attach the MatchQueue (API endpoint + Swagger docs) to the given Flask app
    :param app: The app to create the endpoint for
    :return: None
    """
    blueprint = Blueprint('api_matchmaking', __name__)
    api = Api(blueprint)
    api.add_resource(MatchQueueResource, '/api/matchmaking')
    app.register_blueprint(blueprint, url_prefix='/') # Relative to api.add_resource path
    add_swagger(api)