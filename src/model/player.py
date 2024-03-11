from typing import List

from flask import current_app
from sqlalchemy import BigInteger, ForeignKey, Column, Integer
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.model.spell import Spell
from src.model.spell import association_table as player_spell_association_table


class Player(current_app.db.Model):
    """
    A Player is a profile for a user, containing information about their level, crystals, mana, and spells
    It has a one-to-one, weak relationship with the UserProfile (that holds more sensitive information such as username and password hash)

    Everything game related is stored in the Player profile
    For more details, see the ER diagram in the docs
    """

    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="player", single_parent=True)

    level: Mapped[int] = Column(BigInteger, nullable=False, default=0)
    crystals: Mapped[int] = Column(BigInteger, nullable=False, default=0)
    mana: Mapped[int] = Column(Integer, nullable=False, default=0)

    # lazy=False means that the spells are loaded when the player is loaded
    spells: Mapped[List[Spell]] = relationship(lazy=False, secondary=player_spell_association_table)


    def __init__(self, user_profile=None, level: int = 0, crystals: int = 0, mana: int = 0):
        self.user_profile = user_profile
        self.level = level
        self.crystals = crystals
        self.mana = mana

    def update(self, data: dict):
        """
        Update the player profile with new data
        :param data: The new data
        :return:
        """
        self.level = data.get('level', self.level)
        self.crystals = data.get('crystals', self.crystals)
        self.mana = data.get('mana', self.mana)
        if 'spells' in data:
            # ignore pyCharm warning about data types, it's wrong
            new_spellset = []
            for spell_id in data.get('spells'):
                spell = Spell.query.get(spell_id)
                if spell is None:
                    raise ValueError(f"Spell {spell_id} not found")
                new_spellset.append(spell)

            # Update the spells after checking if the spell id's exist. Otherwise we might remove all spells if the input is invalid
            # The type hinting is wrong here, but it's a bug in pyCharm
            self.spells = new_spellset


