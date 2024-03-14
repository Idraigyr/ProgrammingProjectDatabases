from sqlalchemy import String, Column, BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.model.placeable.building import Building


class MineBuilding(Building):
    """
    A building that can mine crystals (or maybe other resources) over time
    """
    building_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('building.placeable_id'), primary_key=True)

    mine_type: Mapped[str] = Column(String, nullable=False, default='crystal')
    mined_amount: Mapped[int] = Column(BigInteger, nullable=False, default=0)


    def __init__(self, xpos:int = 0, zpos: int = 0, level: int = 0, mine_type: str = '', mined_amount: int = 0) -> None:
        super().__init__(xpos, zpos, level)
        self.mine_type = mine_type
        self.mined_amount = mined_amount


    def update(self, data: dict):
        super().update(data)
        if data.get('mine_type', self.mine_type) not in ['crystal']:
            raise ValueError('Invalid mine_type')

        self.mine_type = data.get('mine_type', self.mine_type)

    __mapper_args__ = {
        'polymorphic_identity': 'mine_building'
    }


class AltarBuilding(Building):

    def __init__(self, xpos: int = 0, zpos: int = 0, level: int = 0):
        super().__init__(xpos, zpos, level)

    def update(self, data: dict):
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'altar_building'
    }


class FuseTableBuilding(Building):

    def __init__(self, xpos: int = 0, zpos: int = 0, level: int = 0):
        super().__init__(xpos, zpos, level)

    def update(self, data: dict):
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'fuse_table_building'
    }


class WarriorHutBuilding(Building):
    def __init__(self, xpos: int = 0, zpos: int = 0, level: int = 0):
        super().__init__(xpos, zpos, level)

    def update(self, data: dict):
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'warrior_hut_building'
    }