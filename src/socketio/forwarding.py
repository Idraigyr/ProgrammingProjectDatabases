import logging

from flask import request, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_socketio import Namespace
from jwt import ExpiredSignatureError

# Set this to True if you want to broadcast forwarded the message to the sender as well
# It will ignore the original sender session, but will broadcast to all other sessions
BROADCAST_TO_SELF: bool = True

class ForwardingNamespace(Namespace):

    def __init__(self, namespace):
        super().__init__(namespace)
        self._log = logging.getLogger(__name__)
        self.clients: dict = {}

    def get_user_from_sid(self, sid):
        for user_id, sids in self.clients.items():
            if sid in sids:
                return user_id
        return None


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
            self.clients[user_id] = [sid]
        else:
            self.clients[user_id].append(sid)

    # Remove clients when they disconnect
    def on_disconnect(self):
        """
        Remove the clients when they disconnect
        """
        sid = request.sid

        for user_id, sids in self.clients.items():
            if sid in sids:
                sids.remove(sid)
                if len(sids) == 0:
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
            targetSids = self.clients[targetId]
            senderId = self.get_user_from_sid(request.sid)

            if BROADCAST_TO_SELF:
                # also send the message to the other sender sessions
                selfSessions = self.clients.get(senderId, [])
                targetSids = targetSids + [sid for sid in selfSessions if sid not in selfSessions]

            self._log.debug(f"Forwarding message to user_id = {targetId}: {data}")
            data['sender'] = senderId

            for sid in targetSids:
                self.emit('forwarded', data, room=sid)

        except Exception:
            self._log.error(f"Could not forward message: {data}", exc_info=True)

    def on_match_found(self, data):
        """
        forwards the message to all the clients
        :param data: message from the client
        """
        try:
            # send opponentId to both players, players will fetch opponent details from server via REST API
            target_ids = [int(data['player1']), int(data['player2'])]
            for target_id in target_ids:
                if target_id not in self.clients:
                    self._log.error(f"Client not found: {target_id}. Dropping message.")
                    return
                target_sids = self.clients[target_id]
                sender_id = self.get_user_from_sid(request.sid)

                self._log.debug(f"Forwarding message to user_id = {target_id}: {data}")
                data['sender'] = sender_id
                data['opponent'] = target_ids[1] if target_id == target_ids[0] else target_ids[0]

                for sid in target_sids:
                    self.emit('match_found', data, room=sid)

        except Exception:
            self._log.error(f"Could not send match found message: {data}", exc_info=True)

