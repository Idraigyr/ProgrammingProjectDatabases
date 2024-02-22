from flask import current_app
from sqlalchemy import String, BigInteger
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.model.player import Player


class UserProfile(current_app.db.Model):
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    player: Mapped[Player] = relationship("Player", back_populates="user_profile", cascade="all, delete-orphan")
    firstname: Mapped[str] = current_app.db.Column(String(255), nullable=False)
    lastname: Mapped[str] = current_app.db.Column(String(255), nullable=False)
    username: Mapped[str] = current_app.db.Column(String(255), unique=True)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<UserProfile {self.id} {self.name}>'


