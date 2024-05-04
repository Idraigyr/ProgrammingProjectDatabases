import datetime

from flask import current_app
from sqlalchemy import Column, DateTime, func, String, Integer, ForeignKey
from sqlalchemy.orm import relationship


class ChatMessage(current_app.db.Model):
    
    id = Column(Integer, primary_key=True)
    message = Column(String(255))

    created_at = Column(DateTime)

    user_id = Column(Integer, ForeignKey('player.user_profile_id', ondelete="set null"))
    user = relationship('Player', back_populates='chat_messages', passive_deletes=True)
    
    def __init__(self, message: str, user_id: int):
        self.created_at = datetime.datetime.now()
        self.message = message
        self.user_id = user_id
