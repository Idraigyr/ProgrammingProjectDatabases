from flask import current_app
from sqlalchemy import String, BigInteger, Column, Boolean
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.model.credentials import Credentials
from src.model.player import Player


class UserProfile(current_app.db.Model):
    """
    A user profile is a representation of a user in the database
    It contains information about the user, such as their name, their credentials, and their player object
    Game specific data such as statisitcs, inventory, etc. are stored in the player object
    """
    __tablename__ = "user_profile"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    player: Mapped[Player] = relationship("Player", back_populates="user_profile")
    firstname: Mapped[str] = Column(String(255), nullable=False)
    lastname: Mapped[str] = Column(String(255), nullable=False)
    username: Mapped[str] = Column(String(255), unique=True)
    admin: Mapped[bool] = Column(Boolean(), default=False, server_default="false", nullable=False)

    credentials: Mapped[Credentials] = relationship(back_populates="user_profile", uselist=False)

    def __init__(self, username: str, firstname: str, lastname: str, credentials: Credentials):
        self.username = username
        self.firstname = firstname
        self.lastname = lastname
        self.credentials = credentials
        self.player = Player(self)

    def __repr__(self):
        return f'<UserProfile {self.id} {self.username}>'

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "admin": self.admin,
        }

    def update(self, data: dict):
        """
        Update the user profile with new data
        Only firstname & lastname can be updated
        :param data: The new data
        :return:
        """
        if 'firstname' in data:
            self.firstname = data['firstname']
        if 'lastname' in data:
            self.lastname = data['lastname']
        if 'admin' in data:
            self.admin = data['admin'].lower() == 'true'
        return self


