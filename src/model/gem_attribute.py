from flask import current_app


class GemAttribute(current_app.db.Model):

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
