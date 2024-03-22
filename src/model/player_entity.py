from sqlalchemy import ForeignKey, BigInteger
from sqlalchemy.orm import relationship, Mapped, mapped_column

from src.model.entity import Entity
from src.model.player import Player


class PlayerEntity(Entity):
    """
    A PlayerEntity is the entity representation of a player in the game.
    It is a subclass of Entity and has a one-to-one relationship with a Player.

    The reason the Player object does not hold this information is because the Primary Keys of the Player and Entity
    are different. The Player object has a primary key of user_profile_id, while the Entity object has a primary key of
    entity_id. Therefore, the Player object cannot be an Entity object.
    """

    __table_name__ = 'player_entity'

    entity_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('entity.entity_id'), primary_key=True)

    # player: Mapped[Player] = relationship("Player", back_populates="entity")
    player_id: Mapped[int] = mapped_column("Player", ForeignKey("player.user_profile_id"))
    player: Mapped[Player] = relationship(back_populates="entity")

    def __init__(self, player_id: int = None, island_id: int = None, xpos: int = None, zpos: int = None):
        super().__init__(island_id, xpos, zpos)
        self.player_id = player_id

    def update(self, data: dict):
        """
        Update the PlayerEntity with the given data
        Note: This method cannot update the playerid, neither the island_id (as per superclass spec)
        :param data: The data to update the PlayerEntity with
        """
        super().update(data)


    __mapper_args__ = {
        'polymorphic_identity': 'player'
    }