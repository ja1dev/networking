"""user accounts: every progress row belongs to a user

Creates the users table with the first admin ("admin", no password yet: the app sets it from
APP_PASSWORD on startup) and gives every existing row to that admin.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-29 10:30:00
"""
from contextlib import contextmanager
from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

# Tables whose primary key gains user_id as its first column.
KEYED = {
    'page_progress': ['doc_id', 'page_id'],
    'card_states': ['card_id'],
    'lab_progress': ['lab_id'],
    'lab_item_checks': ['item_id'],
    'settings': ['key'],
    'terminal_progress': ['lab_id'],
    'terminal_task_passes': ['lab_id', 'task_no'],
}
# Tables keyed by their own id: user_id is an indexed column.
LOGGED = ['quiz_sessions', 'question_attempts', 'card_reviews', 'drill_attempts']

users = sa.table('users', sa.column('id', sa.Integer), sa.column('username', sa.String),
                 sa.column('password_hash', sa.String), sa.column('role', sa.String),
                 sa.column('session_version', sa.Integer), sa.column('created_at', sa.DateTime(timezone=True)))


def _rekeyed_copy(table, key):
    """The table as it stands now, but with key as its primary key, for SQLite to rebuild from."""
    current = sa.Table(table, sa.MetaData(), autoload_with=op.get_bind())
    columns = [sa.Column(c.name, c.type, nullable=c.nullable, server_default=c.server_default)
               for c in current.columns]
    foreign_keys = [sa.ForeignKeyConstraint([e.parent.name for e in fk.elements],
                                            [e.target_fullname for e in fk.elements],
                                            name=fk.name, ondelete=fk.ondelete)
                    for fk in current.foreign_key_constraints]
    copy = sa.Table(table, sa.MetaData(), *columns, *foreign_keys,
                    sa.PrimaryKeyConstraint(*key, name=table + '_pkey'))
    for index in current.indexes:
        sa.Index(index.name, *[copy.c[c.name] for c in index.columns], unique=index.unique)
    return copy


@contextmanager
def _rekeyed(table, key):
    """A batch on table that also changes its primary key to key."""
    if op.get_bind().dialect.name == 'sqlite':
        # SQLite can't alter a key: the batch rebuilds the table from a copy that has the new one.
        with op.batch_alter_table(table, copy_from=_rekeyed_copy(table, key), recreate='always') as batch_op:
            yield batch_op
    else:
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.drop_constraint(table + '_pkey', type_='primary')
            batch_op.create_primary_key(table + '_pkey', key)
            yield batch_op


def upgrade():
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=32), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=True),
    sa.Column('role', sa.String(length=8), nullable=False),
    sa.Column('session_version', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.bulk_insert(users, [{'username': 'admin', 'password_hash': None, 'role': 'admin',
                            'session_version': 0, 'created_at': datetime.now(timezone.utc)}])
    admin_id = op.get_bind().execute(sa.select(users.c.id).where(users.c.username == 'admin')).scalar_one()

    for table in list(KEYED) + LOGGED:
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        op.execute(sa.table(table, sa.column('user_id', sa.Integer)).update().values(user_id=admin_id))
        keyed = table in KEYED
        with (_rekeyed(table, ['user_id'] + KEYED[table]) if keyed
              else op.batch_alter_table(table, schema=None)) as batch_op:
            batch_op.alter_column('user_id', existing_type=sa.Integer(), nullable=False)
            batch_op.create_foreign_key('fk_%s_user_id_users' % table, 'users', ['user_id'], ['id'],
                                        ondelete='CASCADE')
            if not keyed:
                batch_op.create_index(batch_op.f('ix_%s_user_id' % table), ['user_id'], unique=False)


def downgrade():
    # Only one person's progress fits the old single-user tables: keep the first admin's.
    bind = op.get_bind()
    admin_id = bind.execute(sa.select(users.c.id).where(users.c.role == 'admin')
                            .order_by(users.c.id).limit(1)).scalar_one()
    for table in list(KEYED) + LOGGED:
        rows = sa.table(table, sa.column('user_id', sa.Integer))
        op.execute(rows.delete().where(rows.c.user_id != admin_id))
        keyed = table in KEYED
        with (_rekeyed(table, KEYED[table]) if keyed
              else op.batch_alter_table(table, schema=None)) as batch_op:
            if not keyed:
                batch_op.drop_index(batch_op.f('ix_%s_user_id' % table))
            batch_op.drop_constraint('fk_%s_user_id_users' % table, type_='foreignkey')
            batch_op.drop_column('user_id')
    op.drop_table('users')
