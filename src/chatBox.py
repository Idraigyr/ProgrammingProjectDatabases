from flask import current_app
from flask_socketio import SocketIO, send
from time import localtime, strftime

from src.model.chat_message import ChatMessage

socketio = SocketIO()


@socketio.on('message')
def message(data):
    """
    sends message to all the clients
    :param data: message from the client
    """
    # Log the message to the DB
    try:

        chat_message = ChatMessage(message=data['message'], user_id=int(data['user_id']))
        current_app.db.session.add(chat_message)
        current_app.db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Could not save chat message to DB: {e}")

    msg = data['message']
    username = data['username']
    time_stamp = strftime("%b-%d %I:%M%p", localtime())
    send({"username": username, "message": msg, "time_stamp": time_stamp}, broadcast=True)
