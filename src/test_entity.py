from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app import db

class TestEntity(db.Model):
    __tablename__ = 'test_entity'
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255))

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<TestEntity {self.name}>'