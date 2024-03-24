from flask import current_app
from sqlalchemy import BigInteger, String, Column, Integer, SmallInteger, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship, declared_attr


class Placeable(current_app.db.Model):
    """
    A placeable is an abstract class for all placeable (building& props)
    """
    __tablename__ = 'placeable'

    placeable_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    island_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('island.owner_id'), nullable=False)

    @declared_attr
    def island(self):
        return relationship("Island", back_populates="placeables")

    type: Mapped[str] = Column(String(32))

    xpos: Mapped[int] = Column(SmallInteger(), nullable=False, default=0)
    zpos: Mapped[int] = Column(SmallInteger(), nullable=False, default=0)

    blueprint_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey('blueprint.id'), nullable=False, default=0)
    blueprint: Mapped["Blueprint"] = relationship('Blueprint')

    def __init__(self, island_id: int = 0, xpos: int = 0, zpos: int = 0, blueprint_id: int = 0):
        """
        Initializes a placeable object
        :param island_id: The id of the island that this placeable belongs to
        :param xpos: The x position of the building, in the grid. So it is bound by [0,15]
        :param zpos: The z position of the building, in the grid. So it is bound by [0,15]
        :param blueprint_id: The id of the blueprint that builds this placeable
        """
        self.island_id = island_id
        self.xpos = xpos
        self.zpos = zpos
        self.blueprint_id = blueprint_id


    def update(self, data: dict):
        """
        Updates the placeable object new data
        Updating the id, island_id and type are not allowed
        :param data: The new data
        :return:
        """
        self.xpos = data.get('x', self.xpos)
        self.zpos = data.get('z', self.zpos)


    __mapper_args__ = {
        'polymorphic_on': 'type'
    }
