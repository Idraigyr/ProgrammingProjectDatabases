from sqlalchemy import ForeignKey, BigInteger, SmallInteger, Column
from sqlalchemy.orm import mapped_column, Mapped

from src.model.placeable.placeable import Placeable


class Building(Placeable):
    """
    A building is an object that can be placed on the grid
    """

    placeable_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('placeable.placeable_id'), primary_key=True)

    level: Mapped[int] = Column(SmallInteger(), default=0, nullable=False)

    def __init__(self, xpos: int = 0, zpos: int = 0, level: int = 0) -> None:
        """
        Create a new building object with the given parameters
        :param xpos: The x position of the building on the grid
        :param zpos: The z position of the building on the grid
        :param level: The level of the building
        """
        super().__init__(xpos, zpos)
        self.level = level


    def update(self, data: dict):
        """
        Update the building object with the given data
        :param data:
        :return:
        """
        super().update(data)
        self.level = data.get('level', self.level)

    __mapper_args__ = {
        'polymorphic_identity': 'building'
    }