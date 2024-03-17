from enum import Enum


class TowerBuildingType(Enum):
    """
    An enum for the different types of towers
    """
    MAGIC = 'magic'

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_


class MineBuildingType(Enum):
    """
    An enum for the different types of mines
    """
    CRYSTAL = 'crystal'

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_
