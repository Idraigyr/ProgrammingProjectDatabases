from flask import current_app
from sqlalchemy import Integer, String


class TestEntity(current_app.db.Model):
    id = current_app.db.Column(Integer, primary_key=True)
    name = current_app.db.Column(String(255))

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<TestEntity {self.name}>'