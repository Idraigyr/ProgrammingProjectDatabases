from typing import List

from flask import current_app
from sqlalchemy import BigInteger, ForeignKey, Column, Integer, CheckConstraint, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.model.chat_message import ChatMessage
from src.model.blueprint import Blueprint
from src.model.spell import Spell
from src.model.spell import association_table as player_spell_association_table
from src.model.user_profile import UserProfile

blueprint_association_table = current_app.db.Table(
    'blueprint_association', current_app.db.Model.metadata,
    Column('player_id', BigInteger, ForeignKey('player.user_profile_id')),
    Column('blueprint_id', BigInteger, ForeignKey('blueprint.id'))
)


class Player(current_app.db.Model):
    """
    A Player is a profile for a user, containing information about their level, crystals, mana, and spells
    It has a one-to-one, weak relationship with the UserProfile (that holds more sensitive information such as username
    and password hash)

    Everything game related is stored in the Player profile
    It is not an entity, that is the task of the one-to-one associated PlayerEntity object. This is because an
    userprofile id (PK of UserProfile & Player) differs from an entity id (PK of Entity)
    For more details, see the ER diagram in the docs
    """

    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped[UserProfile] = relationship("UserProfile", back_populates="player", single_parent=True, foreign_keys=[user_profile_id])

    crystals: Mapped[int] = Column(BigInteger, CheckConstraint('crystals >= 0'), nullable=False, default=0)
    mana: Mapped[int] = Column(Integer, CheckConstraint('mana >= 0 AND mana <= 1000'), nullable=False, default=0)
    xp: Mapped[int] = Column(Integer, CheckConstraint('xp >= 0'), nullable=False, default=0)
    last_logout: Mapped[DateTime] = Column(DateTime, nullable=False, default=0)
    last_login: Mapped[DateTime] = Column(DateTime, nullable=False, default=func.now())

    # entity_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('player_entity.entity_id'))
    # entity: Mapped["PlayerEntity"] = relationship("PlayerEntity", foreign_keys=[entity_id], back_populates="player")
    entity: Mapped['PlayerEntity'] = relationship(back_populates="player")

    # lazy=False means that the spells are loaded when the player is loaded
    spells: Mapped[List[Spell]] = relationship(lazy=False, secondary=player_spell_association_table)

    # The island of the player
    island: Mapped["Island"] = relationship("Island", back_populates="owner", single_parent=True)

    # User settings
    user_settings: Mapped["UserSettings"] = relationship("UserSettings", back_populates="player", single_parent=True)

    # The gem inventory of the player
    gems: Mapped[List["Gem"]] = relationship("Gem")

    # The unlocked blueprints of the player
    blueprints: Mapped[List["Blueprint"]] = relationship("Blueprint", secondary=blueprint_association_table)

    # The player chat messages
    chat_messages: Mapped[List[ChatMessage]] = relationship("ChatMessage", back_populates="user")

    def __init__(self, user_profile=None, crystals: int = 0, mana: int = 0, xp: int = None, last_logout: DateTime = None, last_login: DateTime = None):
        """
        Initialize the player class
        :param user_profile: The UserProfile of this player. Should be unique to this player (one-to-one)
        :param crystals: The amount of crystals of the player. Should be >= 0
        :param mana: The amount of mana of the player. Should be >= 0
        :param xp: The amount of experience points of the player. Should be >= 0
        :param last_logout: The last logout time of the player
        :param last_login: The last login time of the player
        """
        if xp < 0:
            raise ValueError("XP must be greater than or equal to 0")
        if crystals < 0:
            raise ValueError("Crystals must be greater than or equal to 0")
        if mana < 0 or mana > 1000: # we allow until a 1000 because you can expand your mana pool
            raise ValueError("Mana must be greater than or equal to 0 and less than or equal to 1000")
        if last_logout is None:
            last_logout = 0  # epoch
        if last_login is None:
            last_login = func.now()

        self.user_profile = user_profile
        self.crystals = crystals
        self.mana = mana
        self.xp = xp
        self.last_logout = last_logout
        self.last_login = last_login

    def update(self, data: dict):
        """
        Update the player profile with new data
        :param data: The new data
        :return:
        """
        if data.get('xp', self.xp) < 0:
            raise ValueError("XP must be greater than or equal to 0")
        if data.get('crystals', self.crystals) < 0:
            raise ValueError("Crystals must be greater than or equal to 0")
        if data.get('mana', self.mana) < 0 or data.get('mana', self.mana) > 1000:
            raise ValueError("Mana must be greater than or equal to 0 and less than or equal to 1000")

        self.crystals = data.get('crystals', self.crystals)
        self.mana = data.get('mana', self.mana)
        self.xp = data.get('xp', self.xp)
        self.last_logout = data.get('last_logout', self.last_logout)
        self.last_login = data.get('last_login', self.last_login)

        if 'spells' in data:
            # ignore pyCharm warning about data types, it's wrong
            new_spellset = []
            for spell_id in data.get('spells'):
                spell = Spell.query.get(spell_id)
                if spell is None:
                    raise ValueError(f"Spell {spell_id} not found")
                new_spellset.append(spell)

            # Update the spells after checking if the spell id's exist. Otherwise we might remove all spells if the input is invalid
            # Also, don't simply clear the map as this would mess with SQLAlchemy's internal workings
            # The type hinting is correct here, it's a pyCharm reporting it as wrong
            self.spells = new_spellset

        if 'blueprints' in data:
            new_blueprintset = []
            for blueprint_id in data.get('blueprints'):
                blueprint = Blueprint.query.get(blueprint_id)
                if blueprint is None:
                    raise ValueError(f"Blueprint {blueprint_id} not found")
                new_blueprintset.append(blueprint)
            # See notes of spells above as well
            self.blueprints = new_blueprintset

        if 'entity' in data:
            self.entity.update(data['entity'])
