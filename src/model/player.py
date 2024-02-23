from flask import current_app
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import BigInteger, ForeignKey


class Player(current_app.db.Model):
    user_profile_id: Mapped[BigInteger] = mapped_column(ForeignKey('user_profile.id'), primary_key=True)
    user_profile: Mapped["UserProfile"] = relationship("UserProfile", back_populates="player", single_parent=True)

    xp: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)
    crystals: Mapped[int] = current_app.db.Column(BigInteger, nullable=False, default=0)

    def __init__(self, user_profile, xp: int=0, crystals: int=0):
        self.user_profile = user_profile
        self.xp = xp
        self.crystals = crystals