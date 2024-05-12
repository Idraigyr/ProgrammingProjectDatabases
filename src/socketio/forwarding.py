import logging
from typing import Optional

from flask import request, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_socketio import Namespace
from jwt import ExpiredSignatureError
from sqlalchemy import and_

from src.model.gems import Gem
from src.model.match_queue import MatchQueueEntry

# Set this to True if you want to broadcast forwarded the message to the sender as well
# It will ignore the original sender session, but will broadcast to all other sessions
BROADCAST_TO_SELF: bool = False
MAX_PLAYERS: int = 2
MATCH_TIME: int = 10*60  # 10 minutes


class ForwardingNamespace(Namespace):

    def __init__(self, namespace, app):
        super().__init__(namespace)
        self._log = logging.getLogger(__name__)
        self.clients: dict = {}  # user_id -> sid
        self.playing: dict = {}  # user_id -> match_id
        self.matches: dict = {}  # match_id -> {players[], time_left, timer_task} /// if we want to expand to multiple teams or players change players[id] to players[{id, team}]
        self.app = app

    def get_user_from_sid(self, sid):
        for user_id, current_sid in self.clients.items():
            if sid == current_sid:
                return user_id
        return None

    def update_match_timer(self, match_id):
        """
        Updates the match timer for the given match_id
        :param match_id:
        :return:
        """
        while match_id in self.matches and self.matches[match_id]['time_left'] > 0:
            self.matches[match_id]['time_left'] -= 1
            self._log.debug(f"emitting match_timer: {self.matches[match_id]['time_left']}")
            for player_id in self.matches[match_id]['players']:
                self.emit('match_timer', {'time_left': self.matches[match_id]['time_left']},
                          room=self.clients[player_id])
            self.socketio.sleep(1)
        self._log.debug(f"emitting match_end: {match_id}")
        if match_id in self.matches:
            self.end_match(match_id, None)

    def end_match(self, match_id, winner_id):
        """
        Ends the match and sends the match_end message to the players
        :param match_id: match_id
        :param winner_id: winner_id
        """
        self._log.debug(f"Ending match: {match_id}")
        try:
            with self.app.app_context():
                #transfer ownership of stakes to winner or when there is a draw, return stakes to players
                if winner_id is None:
                    Gem.query.filter(and_(Gem.player_id.in_(self.matches[match_id]['players']), Gem.staked == True)).update({'staked': False})
                else:
                    # player won; transfer gems to player
                    Gem.query.filter(and_(Gem.player_id.in_(self.matches[match_id]['players']), Gem.staked == True)).update({'player_id': winner_id, 'staked': False})
                current_app.db.session.commit()

            for player_id in self.matches[match_id]['players']:
                del self.playing[player_id]
                self.emit('match_end', {'winner_id': winner_id}, room=self.clients[player_id])
            self.matches.pop(match_id)
        except Exception:
            self._log.error(f"Could not end match: {match_id}", exc_info=True)

    def on_altar_destroyed(self, data):
        """
        Handles the altar destroyed event i.e. a player has won the match
        :param data: message from the client
        """
        try:
            match_id = data['match_id']
            if match_id not in self.matches:
                self._log.error(f"Match not found: {match_id}. Dropping message.")
                return
            winner_id = self.get_user_from_sid(request.sid)
            self.end_match(match_id, winner_id)
        except Exception:
            self._log.error(f"Could not end match: {data}", exc_info=True)

    # Register clients when they connect
    def on_connect(self):
        """
        Register the clients when they connect
        """
        sid = request.sid

        try:
            verify_jwt_in_request()
        except ExpiredSignatureError:
            self._log.error(f"JWT token expired. Refusing to connect")
            return
        except NoAuthorizationError:
            self._log.error(f"JWT token missing. Refusing to connect")
            return
        except Exception:
            self._log.error(f"Could not verify JWT token. Refusing to connect", exc_info=True)
            return

        user_id = get_jwt_identity()
        self._log.info(f"Client connected: user_id={user_id}, sid={sid}")

        if user_id not in self.clients:
            self.clients[user_id] = sid
        else:
            self._log.error(f"player is already logged in", exc_info=True)
            self.emit('already_connected', room=sid)
            #TODO: send error message to client that they are already connected

    # Remove clients when they disconnect
    def on_disconnect(self):
        """
        Remove the clients when they disconnect
        """
        sid = request.sid
        for user_id, current_sid in self.clients.items():
            if sid != current_sid:
                continue
            # end match if player was in a match
            if user_id in self.playing:
                match_id = self.playing[user_id]
                self.end_match(match_id, self.matches[match_id]['players'][0] if self.matches[match_id]['players'][
                                                                                     0] != user_id else
                self.matches[match_id]['players'][1])

            # remove player from match queue if they were in it
            db_entry: Optional[MatchQueueEntry] = MatchQueueEntry.query.filter_by(player_id=user_id).first()

            if db_entry is not None:
                current_app.db.session.delete(db_entry)
                current_app.db.session.commit()

            # remove player from clients
            self.clients.pop(user_id)
            self._log.info(f"Client disconnected: user_id={user_id}, sid={sid}")
            break

    def on_forward(self, data):
        """
        forwards the message to all the clients
        :param data: message from the client
        """
        try:
            targetId = int(data['target'])
            if targetId not in self.clients:
                self._log.error(f"Client not found: {targetId}. Dropping message.")
                return
            target_sids = [self.clients[targetId]]
            senderId = self.get_user_from_sid(request.sid)

            if BROADCAST_TO_SELF:
                # also send the message to the other sender sessions
                target_sids.append(request.sid)

            # self._log.debug(f"Forwarding message to user_id = {targetId}: {data}")
            data['sender'] = senderId

            for sid in target_sids:
                self.emit('forwarded', data, room=sid)

        except Exception:
            self._log.error(f"Could not forward message: {data}", exc_info=True)

    def on_player_ready(self, data):
        """
        registers that the player is ready to play (i.e. has loaded the multiplayer match),
        and starts the match if all players are ready
        :param data: message from the client
        :return:
        """
        try:
            senderId = self.get_user_from_sid(request.sid)
            match_id = data['match_id']
            self._log.debug(f"Player ready: player_id: {senderId}, match_id: {match_id}")
            if (senderId not in self.playing):
                self.playing[senderId] = data['match_id']

                #add match to matches when first player is ready
                if (match_id not in self.matches):
                    self.matches[match_id] = {'players': [], 'time_left': MATCH_TIME}

                self.matches[match_id]['players'].append(senderId)
                if len(self.matches[match_id]['players']) > MAX_PLAYERS - 1:
                    #start the match both players are ready
                    for player_id in self.matches[match_id]['players']:
                        self.emit('match_start', room=self.clients[player_id])
                        self._log.debug(f"match started: {match_id}")
                    self.socketio.start_background_task(self.update_match_timer, match_id)

        except Exception:
            self._log.error(f"Could not start match: {data}", exc_info=True)
            #TODO: send abort message to both players

    def on_player_leaving(self, data):
        """
        registers that the player is leaving the match
        :param data: message from the client
        :return:
        """
