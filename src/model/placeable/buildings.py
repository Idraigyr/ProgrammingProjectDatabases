from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SqlEnum

from src.model.gems import Gem
from src.model.enums import TowerBuildingType, MineBuildingType, BlueprintType
from src.model.placeable.building import Building


class MineBuilding(Building):
    """
    A building that can mine crystals (or maybe other resources) over time
    The mined resources can be collected by the player. The amount mined increases over time depending on the
    running tasks. It is also capped based on the level of the building
    """
    placeable_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('building.placeable_id'), primary_key=True)

    mine_type: Mapped[MineBuildingType] = Column(SqlEnum(MineBuildingType), nullable=False, default='crystal')
    mined_amount: Mapped[int] = Column(BigInteger, nullable=False, default=0)

    collected_gem: Mapped[Gem] = relationship(back_populates='mine')



    def __init__(self, island_id:int = 0, x:int = 0, z: int = 0, level: int = 0, mine_type: str = 'crystal', mined_amount: int = 0) -> None:
        """
        Create a new mine building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param x: The x position of the building on the grid
        :param z: The z position of the building on the grid
        :param level: The level of the building
        :param mine_type: The type of the mine (default is 'crystal')
        :param mined_amount: The amount the mine has already mined since the last pickup by the player
        After pickup, this is reset to 0 and the player crystal count is increased
        """
        super().__init__(island_id, xpos=x, zpos=z, level=level, blueprint_id=BlueprintType.MINE.value)
        if not MineBuildingType.has_value(mine_type):
            raise ValueError('Invalid mine_type')

        self.mine_type = MineBuildingType[mine_type.upper()]
        self.mined_amount = mined_amount


    def update(self, data: dict):
        """
        Update the mine building object with the given data
        :param data: The new data. In this class, only the mine_type can be updated
        (it does call super().update(), so check the docs over there as well)
        :return:
        """
        super().update(data)
        if not MineBuildingType.has_value(data.get('mine_type', self.mine_type)):
            raise ValueError('Invalid mine_type')

        # Ignore pycharm warning, it's wrong
        self.mine_type = MineBuildingType[data.get('mine_type', self.mine_type).upper()]

    __mapper_args__ = {
        'polymorphic_identity': 'mine_building'
    }


class TowerBuilding(Building):
    """
    A Tower that can attack enemy warriors and/or buildings (aka the island)
    It has no function in single player mode
    """

    placeable_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('building.placeable_id'), primary_key=True)

    tower_type: Mapped[TowerBuildingType] = Column(SqlEnum(TowerBuildingType), nullable=False, default='magic')

    def __init__(self, island_id: int = 0, tower_type: TowerBuildingType = TowerBuildingType.MAGIC, x: int = 0, z: int = 0, level: int = 0):
        """
        Create a new tower building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param tower_type: The type of the tower (default is 'magic')
        :param x: The x position of the building on the grid
        :param z: The z position of the building on the grid
        :param level: The level of the building
        """
        super().__init__(island_id, xpos=x, zpos=z, level=level, blueprint_id=BlueprintType.TOWER.value)
        if not TowerBuildingType.has_value(tower_type):
            raise ValueError('Invalid tower_type')

        self.tower_type = TowerBuildingType[tower_type.upper()]

    def update(self, data: dict):
        """
        Update the tower building object with the given data
        Only the tower_type can be updated in this class.
        However, it does call super().update(), so check the docs over there as well
        :param data: The new data
        :return:
        """
        super().update(data)
        if not TowerBuildingType.has_value(data.get('tower_type', self.tower_type)):
            raise ValueError('Invalid tower_type')

        # Ignore pycharm warning, it's wrong
        self.tower_type = TowerBuildingType[data.get('tower_type', self.tower_type).upper()]

    __mapper_args__ = {
        'polymorphic_identity': 'tower_building'
    }




class AltarBuilding(Building):
    """
    An altar building is the central hub of the island
    A player can open it's menu to see the island's stats and resources (such as gems etc)
    Only one altar can exist on an island
    """

    def __init__(self, island_id: int = 0, x: int = 0, z: int = 0, level: int = 0):
        """
        Create a new altar building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param x: The x position of the building on the grid
        :param z: The z position of the building on the grid
        :param level: The level of the building
        """
        super().__init__(island_id, xpos=x, zpos=z, level=level, blueprint_id=BlueprintType.ALTAR.value)

    def update(self, data: dict):
        """
        Update the altar building object with the given data
        See the docs of the parent class for more info
        :param data: The new data
        :return:
        """
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'altar_building'
    }


class FuseTableBuilding(Building):
    """
    A fuse table allows a player to convert crystals into (random) gems
    This process requires some idle time
    """

    def __init__(self, island_id:int = 0, x: int = 0, z: int = 0, level: int = 0):
        """
        Create a new fuse table building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param x: THe x position of the building on the grid
        :param z: The z position of the building on the grid
        :param level: The level of the building
        """
        super().__init__(island_id, xpos=x, zpos=z, level=level, blueprint_id=BlueprintType.FUSE_TABLE.value)

    def update(self, data: dict):
        """
        Update the fuse table building object with the given data
        See the docs of the parent class for more info
        :param data: THe new data
        :return:
        """
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'fuse_table_building'
    }


class WarriorHutBuilding(Building):
    """
    The warrior hut allows a player to spawn warriors from. The warriors can be used to attack other islands
    and/or warriors during a multiplayer game.
    It has no function in single player mode
    """

    def __init__(self, island_id: int = 0, x: int = 0, z: int = 0, level: int = 0):
        """
        Create a new warrior hut building object with the given parameters
        :param island_id: The id of the island that this building belongs to
        :param x: The x position of the building on the grid
        :param z: The z position of the building on the grid
        :param level: The level of the building
        """
        super().__init__(island_id, xpos=x, zpos=z, level=level, blueprint_id=BlueprintType.WARRIOR_HUT.value)

    def update(self, data: dict):
        """
        Update the warrior hut building object with the given data
        See the docs of the parent class for more info
        :param data: The new data
        :return:
        """
        super().update(data)

    __mapper_args__ = {
        'polymorphic_identity': 'warrior_hut_building'
    }