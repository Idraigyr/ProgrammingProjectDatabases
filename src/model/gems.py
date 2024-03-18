from flask import current_app
from sqlalchemy import BigInteger, Enum, Column, Table, ForeignKey, SmallInteger, String, Float
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.model.enums import GemType

# The relationship table for the many-to-many relationship between gems and gem attributes
# association_table = Table('gem_association', current_app.db.metadata,
#                             Column('gem_id', BigInteger, ForeignKey('gem.id')),
#                             Column('attribute_id', SmallInteger, ForeignKey('gem_attribute.id')),
#                             Column('multiplier', Float)
#                           )


class Gem(current_app.db.Model):

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    type: Mapped[GemType] = Column(Enum(GemType), default=GemType, nullable=False)

    # The many-to-one relationsip between gems and buildings
    building_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('building.placeable_id'), nullable=True)

    # attributes: Mapped[list] = relationship('GemAttribute', secondary=association_table)
    attributes_association = relationship("GemAttributeAssociation")

    # Using association proxy to access multiplier value
    # Ignore the type warning, it's wrong
    attributes = association_proxy('attributes_association', 'attribute',
                                   creator=lambda map: GemAttributeAssociation(
                                       gem_id=map['gem_id'],
                                       gem_attribute_id=map['gem_attribute_id'],
                                       multiplier=map['multiplier']
                                   ))

    def __init__(self, type: str = None, attributes=None):
        if attributes is None:
            attributes = []

        if not GemType.has_value(type):
            raise ValueError('Invalid gem type')

        self.type = GemType[type.upper()]
        self.attributes = attributes


    def update(self, data: dict):
        """
        Update the gem object with the given data
        The attributes list of the data input will be synced with the gem's attributes
        Deleting attributes is currently NOT supported, only adding and updating existing ones.
        As a temporary workaround for unable to delete attributes, you can set the multiplier to 0
        :param data: The new data
        :return:
        """
        if len(list(data.keys() & ['building_id'])) > 1:
            raise ValueError('Invalid data object, at most one of the following keys is allowed: "building_id". '
                             'Note that the absence of the key will unlink it from its relation with said attribute')


        if 'type' in data:
            if not GemType.has_value(data['type']):
                raise ValueError('Invalid gem type')
            self.type = GemType[data['type'].upper()]

        if 'attributes' in data:
            for obj in data['attributes']:
                if 'gem_attribute_id' not in obj or 'multiplier' not in obj:
                    raise ValueError('Invalid attribute object')
                # Cannot simply clear the map as this would mess with SQLAlchemys internal state of the entity
                # We need therefore to update the existing map with the new values

                # Update existing entries
                found = False
                for assoc in self.attributes_association:
                   if assoc.attribute.id == obj['gem_attribute_id']:
                       assoc.multiplier = obj['multiplier']
                       found = True

                if not found: # If the for loop didn't run
                    # Create new entries
                    self.attributes_association.append(GemAttributeAssociation(**obj))

        if 'building_id' in data:
            self.building_id = int(data['building_id'])
        else:
            # If the building_id is not in the data, set it to None (NULL), therefore unlinking its relation with
            # (in this case) the building
            self.building_id = None

class GemAttribute(current_app.db.Model):
    """
    A GemAttribute is a type of attribute that can be added to a gem
    Only a fixed set of attributes exist, therefore no enum is defined on the type
    """

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    type: Mapped[str] = Column(String(16), nullable=False, unique=True)

    def __init__(self, id: int = None, type: str = None):
        self.id = id
        self.type = type


# Association Object for Gem-GemAttribute with multiplier
class GemAttributeAssociation(current_app.db.Model):
    __tablename__ = 'gem_attribute_association'
    gem_id = Column(BigInteger, ForeignKey('gem.id'), primary_key=True)
    gem_attribute_id = Column(SmallInteger, ForeignKey('gem_attribute.id'), primary_key=True)
    multiplier = Column(Float)
    gem = relationship("Gem", back_populates="attributes_association")
    attribute = relationship("GemAttribute")

    def __init__(self, gem_id: int = None, gem_attribute_id: int = None, multiplier: float = None, **kwargs):
        # leave **kwargs in case of future use
        self.gem_id = gem_id
        self.gem_attribute_id = gem_attribute_id
        self.multiplier = multiplier






