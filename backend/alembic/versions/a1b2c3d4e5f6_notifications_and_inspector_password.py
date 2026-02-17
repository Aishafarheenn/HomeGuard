"""notifications user_id/user_type/is_read and inspector password_hash

Revision ID: a1b2c3d4e5f6
Revises: 1426f57daf30
Create Date: 2026-02-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "1426f57daf30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Notifications: add polymorphic user fields and is_read
    op.add_column("notifications", sa.Column("user_id", sa.UUID(), nullable=True))
    op.add_column("notifications", sa.Column("user_type", sa.String(20), nullable=True))
    op.add_column("notifications", sa.Column("is_read", sa.Boolean(), nullable=True, server_default=sa.false()))
    # Backfill existing rows (owner_id -> user_id, user_type='owner')
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        op.execute("""
            UPDATE notifications SET user_id = owner_id, user_type = 'owner', is_read = false
            WHERE user_id IS NULL AND owner_id IS NOT NULL
        """)
    else:
        op.execute("""
            UPDATE notifications SET user_id = owner_id, user_type = 'owner', is_read = 0
            WHERE user_id IS NULL AND owner_id IS NOT NULL
        """)
    op.alter_column("notifications", "user_id", nullable=False)
    op.alter_column("notifications", "user_type", nullable=False)
    op.alter_column("notifications", "is_read", nullable=False)
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)

    # Inspector: add password_hash (nullable for existing rows)
    op.add_column("inspector", sa.Column("password_hash", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_column("notifications", "is_read")
    op.drop_column("notifications", "user_type")
    op.drop_column("notifications", "user_id")
    op.drop_column("inspector", "password_hash")
