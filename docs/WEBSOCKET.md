# Websocket (SocketIO)

Immediate communication is done through Websockets using the SocketIO library. This allows for real-time communication between the client and the server. The server can send messages to the client and the client can send messages to the server. This is useful for real-time updates like chat, but most notably: real-time multiplayer. 

SocketIO uses Websockets as a transport layer, but it also has fallbacks to other transports like long-polling, which is useful for older browsers that do not support Websockets.

## General
We use SocketIO namespaces for 'grouping' of messages and events. This allows us to have multiple 'channels' of communication. For example, we have a namespace for the game (most notably forwarding for peer-to-peer communication) and a namespace for the chat. This allows us to have different events and messages for each namespace.

On the backend, adding a new namespace is done by adding a new [Namespace class](https://flask-socketio.readthedocs.io/en/latest/getting_started.html#class-based-namespaces) in the `socketio` module. This class should inherit from `flask_socketio.Namespace` and should have a `@socketio.on('event')` decorator for each event that it should handle.
Register this class in the `socketio` module by importing it in the `__init__.py` file and register it using `socketio.on_namespace()`.

On the frontend, you can connect to a namespace by calling `io('/namespace')`. This will return a socket connection for the given namespace that allow you to send and receive messages from that namespace.

The data field / contents of a message is always a JSON object. 
A 'session' is a single WebSocket connection between a client and the server. A 'player'/'user' can have multiple sessions (for example, when the player is logged in on multiple devices/tabs).

## Chat
The chat is a simple example of a SocketIO namespace. It has a single event: `message` that holds the chat message, a username and the timestamp. Client sends a message to the server using the `message` event with the given parameters and the server will broadcast this message to all connected clients (thus also to the original sender).

## Forwarding
A client can forward a message to another client using the `forward` namespace. The sender is required to set a target user id in the `target` field of the message. The server will then forward this message to the target user. The target user will receive the message using the `forwarded` event and the original JSON object.
The server will also send the message to other sessions (not the sending session) of the same player to keep the state in sync. A `sender` field is added to the root JSON object with the userid of the original sender of the message.

Example of a message that is forwarded:
```json
{
  "target": <target_user_id:int>,
  "message": "Hello, this is a forwarded message!",
  ... other JSON attributes
}
```
