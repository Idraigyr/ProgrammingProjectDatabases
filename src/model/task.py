import datetime

from flask import current_app
from sqlalchemy import BigInteger, DateTime, Column, func, String, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, declared_attr, relationship


class Task(current_app.db.Model):
    """
    A Task is an object to keep track of running idle activities.
    It has a polymorphic relationship (not total!) with other tasks, such as BuildingUpgradeTask

    A task on its own can mean anything, but it is usually an idle task such as a mine that's mining minerals
    A building that's in construction or in upgrade are represented by a BuildingUpgradeTask
    """


    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    starttime: Mapped[DateTime] = Column(DateTime(timezone=True), nullable=False)
    endtime: Mapped[DateTime] = Column(DateTime(timezone=True), nullable=False)
    # Whether the task has been handeled by the game loop or not.
    # When true and the task is not yet done, the task is cancelled
    handeled: Mapped[bool] = Column(Boolean, nullable=False, default=False)

    type: Mapped[str] = Column(String(32), nullable=False) # Keep track of polymorphic identities

    island_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('island.owner_id'), nullable=False)
    @declared_attr
    def island(self):
        return relationship("Island", back_populates="tasks")


    working_building: Mapped['Building'] = relationship('Building', back_populates='task', uselist=False)


    def __init__(self, endtime: DateTime, island_id: int = None, working_building: 'Building' = None):
        """
        Initialize the task object
        :param endtime: The time when the task should end
        """
        self.starttime = datetime.datetime.now(tz=endtime.tzinfo)
        self.endtime = endtime
        self.island_id = island_id
        self.working_building = working_building


    def update(self, data: dict):
        """
        Update the task with the new endtime
        :param data:
        :return:
        """
        self.endtime = data.get('endtime', self.endtime)
        self.handeled = data.get('handeled', self.handeled)
        self.working_building = data.get('working_building', self.working_building)


    def is_over(self) -> bool:
        """
        Check if the task is done
        :return: True if the task is done, False otherwise
        """
        return self.endtime < datetime.datetime.now(tz=self.endtime.tzinfo)

    def is_cancelled(self) -> bool:
        """
        Check if the task is cancelled
        A task is cancelled when it is handeled and not done
        :return:
        """
        return self.handeled and not self.is_over()

    def should_be_handeled(self) -> bool:
        """
        Check if the task should be handeled
        A task should be handeled when it is not handeled and done
        :return:
        """
        return not self.handeled and self.is_over()

    def is_running(self) -> bool:
        """
        Check if the task is still running
        :return:
        """
        return not self.is_over() and not self.is_cancelled() and not self.handeled


    __mapper_args__ = {
        'polymorphic_identity': 'task',
        'polymorphic_on': type
    }