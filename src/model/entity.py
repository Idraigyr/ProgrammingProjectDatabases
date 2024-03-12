from abc import abstractmethod

from flask import current_app
from sqlalchemy import BigInteger, Integer, Column, String, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship, declared_attr


class Entity(current_app.db.Model):
    """
    Abstract class for entities that have to be persistent (such as players, minions etc)
    In contradiction to Placable, the coordinates are absolute from in the THREE.js world and not transformed onto a grid.
    """
    __tablename__ = "entity"

    entity_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    island_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('island.owner_id'), nullable=False) # Backref to Island

    @declared_attr
    def island(self):
        return relationship("Island", back_populates="entities")

    type: Mapped[str] = Column(String(32)) # Keep track of polymorphic identities

    xpos: Mapped[int] = Column(Integer, nullable=False, default=0)
    zpos: Mapped[int] = Column(Integer, nullable=False, default=0)


    def __init__(self, island_id:int = 0, xpos: int = 0, zpos: int = 0):
        self.island_id = island_id
        self.xpos = xpos
        self.zpos = zpos

    @abstractmethod
    def update(self, data: dict):
        """
        Update the entity with new data
        :param data: The new data
        :return:
        """
        pass

    __mapper_args__ = {
        # 'polymporphic_abstract': True,
        'polymorphic_on': 'type'
    }
