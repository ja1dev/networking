"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-10-28 09:55:38.266067
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('card_reviews',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('card_id', sa.String(length=32), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('state_before', sa.String(length=12), nullable=False),
    sa.Column('interval_days', sa.Float(), nullable=False),
    sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('card_reviews', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_card_reviews_card_id'), ['card_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_card_reviews_reviewed_at'), ['reviewed_at'], unique=False)

    op.create_table('card_states',
    sa.Column('card_id', sa.String(length=32), nullable=False),
    sa.Column('state', sa.String(length=12), nullable=False),
    sa.Column('step', sa.Integer(), nullable=False),
    sa.Column('due_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('interval_days', sa.Float(), nullable=False),
    sa.Column('ease', sa.Float(), nullable=False),
    sa.Column('reps', sa.Integer(), nullable=False),
    sa.Column('lapses', sa.Integer(), nullable=False),
    sa.Column('last_reviewed_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('card_id')
    )
    with op.batch_alter_table('card_states', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_card_states_due_at'), ['due_at'], unique=False)

    op.create_table('drill_attempts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('kind', sa.String(length=32), nullable=False),
    sa.Column('item_id', sa.String(length=32), nullable=True),
    sa.Column('correct', sa.Boolean(), nullable=False),
    sa.Column('duration_ms', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('drill_attempts', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_drill_attempts_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_drill_attempts_item_id'), ['item_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_drill_attempts_kind'), ['kind'], unique=False)

    op.create_table('lab_item_checks',
    sa.Column('item_id', sa.String(length=64), nullable=False),
    sa.Column('lab_id', sa.String(length=64), nullable=False),
    sa.Column('checked_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('item_id')
    )
    with op.batch_alter_table('lab_item_checks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_lab_item_checks_lab_id'), ['lab_id'], unique=False)

    op.create_table('lab_progress',
    sa.Column('lab_id', sa.String(length=64), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('note', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('lab_id')
    )
    op.create_table('page_progress',
    sa.Column('doc_id', sa.String(length=32), nullable=False),
    sa.Column('page_id', sa.String(length=160), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('last_visited_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('note', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('doc_id', 'page_id')
    )
    with op.batch_alter_table('page_progress', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_page_progress_last_visited_at'), ['last_visited_at'], unique=False)

    op.create_table('quiz_sessions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('mode', sa.String(length=16), nullable=False),
    sa.Column('question_ids', sa.JSON(), nullable=False),
    sa.Column('time_limit_seconds', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('score', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('settings',
    sa.Column('key', sa.String(length=64), nullable=False),
    sa.Column('value', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('key')
    )
    op.create_table('question_attempts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('question_id', sa.String(length=64), nullable=False),
    sa.Column('session_id', sa.Integer(), nullable=True),
    sa.Column('selected', sa.String(length=16), nullable=False),
    sa.Column('correct', sa.Boolean(), nullable=False),
    sa.Column('context', sa.String(length=16), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['quiz_sessions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('question_attempts', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_question_attempts_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_question_attempts_question_id'), ['question_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_question_attempts_session_id'), ['session_id'], unique=False)

def downgrade():
    with op.batch_alter_table('question_attempts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_question_attempts_session_id'))
        batch_op.drop_index(batch_op.f('ix_question_attempts_question_id'))
        batch_op.drop_index(batch_op.f('ix_question_attempts_created_at'))

    op.drop_table('question_attempts')
    op.drop_table('settings')
    op.drop_table('quiz_sessions')
    with op.batch_alter_table('page_progress', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_page_progress_last_visited_at'))

    op.drop_table('page_progress')
    op.drop_table('lab_progress')
    with op.batch_alter_table('lab_item_checks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_lab_item_checks_lab_id'))

    op.drop_table('lab_item_checks')
    with op.batch_alter_table('drill_attempts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_drill_attempts_kind'))
        batch_op.drop_index(batch_op.f('ix_drill_attempts_item_id'))
        batch_op.drop_index(batch_op.f('ix_drill_attempts_created_at'))

    op.drop_table('drill_attempts')
    with op.batch_alter_table('card_states', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_card_states_due_at'))

    op.drop_table('card_states')
    with op.batch_alter_table('card_reviews', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_card_reviews_reviewed_at'))
        batch_op.drop_index(batch_op.f('ix_card_reviews_card_id'))

    op.drop_table('card_reviews')
