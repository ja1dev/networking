from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine

from app import config, models  # noqa: F401  (registers the tables on Base.metadata)
from app.db import Base

# Not the app's engine: that one turns SQLite foreign keys on, and batch mode rebuilds a table by
# dropping it, which would cascade-delete the rows that point at it.
engine = create_engine(config.DATABASE_URL)

if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=str(engine.url), target_metadata=target_metadata,
                      literal_binds=True, render_as_batch=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    with engine.connect() as connection:
        # Batch mode lets ALTERs work on SQLite (local dev) as well as Postgres.
        context.configure(connection=connection, target_metadata=target_metadata,
                          render_as_batch=True, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
