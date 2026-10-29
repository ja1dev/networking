"""terminal labs

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-28 20:16:17.949196
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('terminal_progress',
    sa.Column('lab_id', sa.String(length=64), nullable=False),
    sa.Column('state', sa.Text(), nullable=False),
    sa.Column('passing', sa.JSON(), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('lab_id')
    )
    op.create_table('terminal_task_passes',
    sa.Column('lab_id', sa.String(length=64), nullable=False),
    sa.Column('task_no', sa.Integer(), nullable=False),
    sa.Column('passed_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('lab_id', 'task_no')
    )
    with op.batch_alter_table('terminal_task_passes', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_terminal_task_passes_passed_at'), ['passed_at'], unique=False)


def downgrade():
    with op.batch_alter_table('terminal_task_passes', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_terminal_task_passes_passed_at'))

    op.drop_table('terminal_task_passes')
    op.drop_table('terminal_progress')
