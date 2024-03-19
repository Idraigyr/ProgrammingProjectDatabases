from sqlalchemy import ForeignKey, BigInteger, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column

from src.model.entity import Entity


class BuilderMinion(Entity):
    """
    A builder minion is a type of entity that can be placed on an island and can build buildings.
    """
    entity_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('entity.entity_id'), primary_key=True)

    level: Mapped[int] = Column(Integer, nullable=False, default=0)


    def __init__(self, island_id: int = 0, x: int = 0, z: int = 0, level: int = 0, type: str = 'builder_minion'):
        assert type == 'builder_minion'
        super().__init__(island_id, x, z)
        self.level = level

    def update(self, data: dict):
        """
        Updates the builder minions' fields by a dictionary
        :param data: The data to update with. Only fields that have to be changed have to be present.
        """
        super().update(data)
        self.level = data.get('level', self.level)


    __mapper_args__ = {
        'polymorphic_identity': 'builder_minion'
    }


