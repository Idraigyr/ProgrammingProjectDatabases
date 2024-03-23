from typing import List

from sqlalchemy import ForeignKey, BigInteger, SmallInteger, Column
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.model.gems import Gem
from src.model.placeable.placeable import Placeable


class Building(Placeable):
    """
    A building is an object that can be placed on the grid
    """

    placeable_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('placeable.placeable_id'), primary_key=True)

    level: Mapped[int] = Column(SmallInteger(), default=0, nullable=False)

    gems: Mapped[List[Gem]] = relationship('Gem')

    def __init__(self, island_id: int = 0, xpos: int = 0, zpos: int = 0, level: int = 0, blueprint_id: int = 0) -> None:
        """
        Create a new building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param xpos: The x position of the building on the grid
        :param zpos: The z position of the building on the grid
        :param level: The level of the building
        :param blueprint_id: The id of the blueprint that can build this building
        """
        super().__init__(island_id, xpos, zpos, blueprint_id)
        self.level = level


    def update(self, data: dict):
        """
        Update the building object with the given data
        Note: blueprint_id cannot be changed
        :param data:
        :return:
        """
        super().update(data)
        self.level = data.get('level', self.level)

    __mapper_args__ = {
        'polymorphic_identity': 'building'
    }