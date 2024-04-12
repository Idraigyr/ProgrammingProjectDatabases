from flask import current_app
from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship, declared_attr

from src.model.player import Player


class Island(current_app.db.Model):
    """
    An island is a collection of entities and placeables (buildings) that are placed on a grid.
    It contains all necessary values to load in an island of a player.
    An island is unique to it's owner, and is not shared between players.
    """

    owner_id: Mapped[int] = mapped_column(ForeignKey('player.user_profile_id', use_alter=True), primary_key=True)

    @declared_attr
    def owner(self):
        return relationship("Player", back_populates="island", single_parent=True, foreign_keys=[self.owner_id])

    @declared_attr
    def entities(self):
        return relationship("Entity", back_populates="island")

    @declared_attr
    def placeables(self):
        return relationship("Placeable", back_populates="island")

    @declared_attr
    def tasks(self):
        return relationship("Task", back_populates="island")

    # Only one altar building can exist on an island
    # So we have a one-to-one relationship with the altar building
    # It should also be non-null as it's the central hub of the island and thus created at the same time as the island
    # It however CAN be null in the database, as it's created after the island is created (circular dependency problem)
    altar_id: Mapped[int] = mapped_column(ForeignKey('building.placeable_id', use_alter=True), nullable=True)

    @declared_attr
    def altar(self):
        return relationship("AltarBuilding", foreign_keys=[self.altar_id], uselist=False)

    def __init__(self, owner: Player = None, altar_id: int = None):
        self.owner = owner
        self.owner_id = owner.user_profile_id
        self.altar_id = altar_id