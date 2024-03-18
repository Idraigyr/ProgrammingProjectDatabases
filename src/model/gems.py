from flask import current_app
from sqlalchemy import BigInteger, Enum, Column
from sqlalchemy.orm import mapped_column, Mapped

from src.model.enums import GemType


class Gem(current_app.db.Model):

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    type: Mapped[GemType] = Column(Enum(GemType), default=GemType, nullable=False)






