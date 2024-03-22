from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from src.model.entity import Entity
from src.model.player import Player


class PlayerEntity(Entity):
    __table_name__ = 'player_entity'

    # player: Mapped[Player] = relationship("Player", back_populates="entity")
    player_id: Mapped[int] = mapped_column("Player", ForeignKey("player.user_profile_id"))
    player: Mapped[Player] = relationship(back_populates="entity")

    def __init__(self, player_id: int = None, island_id: int = None, xpos: int = None, zpos: int = None):
        super().__init__(player_id, island_id, xpos, zpos)
        self.player_id = player_id


    __mapper_args__ = {
        'polymorphic_identity': 'player'
    }