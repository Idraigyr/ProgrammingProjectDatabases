from typing import List

from sqlalchemy import ForeignKey, BigInteger, SmallInteger, Column, DateTime, CheckConstraint
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.model.task import Task
from src.model.upgrade_task import BuildingUpgradeTask
from src.model.gems import Gem
from src.model.placeable.placeable import Placeable


class Building(Placeable):
    """
    A building is an object that can be placed on the grid
    """

    placeable_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('placeable.placeable_id'), primary_key=True)

    level: Mapped[int] = Column(SmallInteger(), CheckConstraint('level >= 0'), default=0, nullable=False)

    gems: Mapped[List[Gem]] = relationship('Gem')

    task_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('task.id'), nullable=True)
    task: Mapped[Task] = relationship("Task", back_populates="working_building")

    def __init__(self, island_id: int = 0, xpos: int = 0, zpos: int = 0, level: int = 0, blueprint_id: int = 0, rotation: int = 0) -> None:
        """
        Create a new building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param xpos: The x position of the building on the grid
        :param zpos: The z position of the building on the grid
        :param level: The level of the building
        :param blueprint_id: The id of the blueprint that can build this building
        :param rotation: The rotation of the building (0=North, 1=East, 2=South, 3=West)
        """
        super().__init__(island_id, xpos, zpos, blueprint_id, rotation)
        if level < 0:
            raise ValueError("Level must be greater than or equal to 0")

        self.level = level

    def create_task(self, endtime: DateTime):
        """
        Create a new 'regular' task for this building
        :param endtime: The time when the task should end
        :return: The new task
        """
        task = Task(endtime, self.island_id, self)
        self.task = task
        return task

    def create_upgrade_task(self, endtime: DateTime, used_crystals: int):
        """
        Create a new upgrade task for this building
        :param endtime: The time when the task should end
        :param used_crystals: The amount of crystals used for the upgrade
        :return: The new task
        """
        task = BuildingUpgradeTask(endtime, self, self.level + 1, used_crystals)
        self.task = task
        return task



    def update(self, data: dict):
        """
        Update the building object with the given data
        Note: blueprint_id cannot be changed
        :param data:
        :return:
        """
        super().update(data)
        if data.get('level', self.level) < 0:
            raise ValueError("Level must be greater than or equal to 0")

        self.level = data.get('level', self.level)

    __mapper_args__ = {
        'polymorphic_identity': 'building'
    }