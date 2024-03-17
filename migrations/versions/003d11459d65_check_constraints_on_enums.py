"""CHECK constraints on enums

Revision ID: 003d11459d65
Revises: 5530022ea50b
Create Date: 2024-03-17 16:10:27.902391

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '003d11459d65'
down_revision = '5530022ea50b'
branch_labels = None
depends_on = None


def upgrade():
    # Have to run raw SQL to add the check constraints
    op.execute('ALTER TABLE mine_building ADD CONSTRAINT mine_type_check CHECK (mine_type = ANY (ARRAY[\'CRYSTAL\']))')
    op.execute('ALTER TABLE tower_building ADD CONSTRAINT tower_type_check CHECK (tower_type = ANY (ARRAY[\'MAGIC\']))')


def downgrade():
    # Have to run raw SQL to remove the check constraints
    op.execute('ALTER TABLE mine_building DROP CONSTRAINT mine_type_check')
    op.execute('ALTER TABLE tower_building DROP CONSTRAINT tower_type_check')
