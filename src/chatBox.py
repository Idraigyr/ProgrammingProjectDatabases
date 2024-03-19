from flask_socketio import SocketIO, send
from time import localtime, strftime
socketio = SocketIO()


@socketio.on('message')
def message(data):
    """
    sends message to all the clients
    :param data: message form the client
    """
    msg = data['message']
    username = data['username']
    time_stamp = strftime("%b-%d %I:%M%p", localtime())
    send({"username": username, "message": msg, "time_stamp": time_stamp}, broadcast=True)
