from flask import current_app

from src.socketio.chat import ChatNamespace
from src.socketio.forwarding import ForwardingNamespace

socketio = current_app.socketio

# Dictionary to store the clients
# key: client id -> list[session id]

# Register the namespaces
socketio.on_namespace(ChatNamespace('/chat'))
socketio.on_namespace(ForwardingNamespace('/forward'))