from flask import current_app
from sqlalchemy import BigInteger, ForeignKey, Column, Integer
from sqlalchemy.orm import mapped_column, Mapped, relationship



class Player(current_app.db.Model):
    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="player", single_parent=True)

    level: Mapped[int] = Column(BigInteger, nullable=False, default=0)
    crystals: Mapped[int] = Column(BigInteger, nullable=False, default=0)
    mana: Mapped[int] = Column(Integer, nullable=False, default=0)

    def __init__(self, user_profile=None, level: int = 0, crystals: int = 0, mana: int = 0):
        self.user_profile = user_profile
        self.level = level
        self.crystals = crystals
        self.mana = mana

    def update(self, data: dict):
        """
        Update the player profile with new data
        :param data: The new data
        :return:
        """
        if 'level' in data:
            self.level = data['level']
        if 'crystals' in data:
            self.crystals = data['crystals']
        if 'mana' in data:
            self.mana = data['mana']

