"""add props data

Revision ID: 22389b2496cb
Revises: dc57db68b859
Create Date: 2024-03-11 20:39:07.493918

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session

# revision identifiers, used by Alembic.
revision = 'aa156f1b0d9e'
down_revision = 'e829e9c7177f'
branch_labels = None
depends_on = None


def upgrade():
    ## This is only a bit of data migration, we add 'tree' and 'bush' as blueprint props to the db
    session = Session(bind=op.get_bind())
    from src.model.blueprint import Blueprint
    from src.model.enums import BlueprintType
    print("INFO Adding props 'Tree' and 'Bush' to db")
    session.add(Blueprint(id=BlueprintType.TREE.value, name="Tree", description="A tree (there's nothing more to it)", cost=40, buildtime=5))
    session.add(Blueprint(id=BlueprintType.BUSH.value, name="Bush", description="A bush (there's nothing more to it)", cost=20, buildtime=5))
    bp = session.query(Blueprint).filter(Blueprint.id == BlueprintType.FUSE_TABLE.value).all()
    bp.name = "FusionTable"
    session.commit()

def downgrade():
    session = Session(bind=op.get_bind())
    from src.model.blueprint import Blueprint
    from src.model.enums import BlueprintType
    print("INFO Removing props from db")
    session.query(Blueprint).filter(Blueprint.id == BlueprintType.TREE.value).delete()
    session.query(Blueprint).filter(Blueprint.id == BlueprintType.BUSH.value).delete()
    bp = session.query(Blueprint).filter(Blueprint.id == BlueprintType.FUSE_TABLE.value).all()
    bp.name = "Fuse Table"
    session.commit()
