from flask import current_app
from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship



class Player(current_app.db.Model):
    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="player", single_parent=True)

    xp: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)
    crystals: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)

    def __init__(self, user_profile=None, xp: int=0, crystals: int=0):
        self.user_profile = user_profile
        self.xp = xp
        self.crystals = crystals

    def update(self, data: dict):
        """
        Update the player profile with new data
        :param data: The new data
        :return:
        """
        if 'xp' in data:
            self.xp = data['xp']
        if 'crystals' in data:
            self.crystals = data['crystals']

