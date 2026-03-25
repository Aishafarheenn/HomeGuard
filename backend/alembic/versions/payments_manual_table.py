"""add manual payments table

Revision ID: payments_manual_table
Revises: add_insp_reviews
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "payments_manual_table"
down_revision: Union[str, None] = "add_insp_reviews"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("schedule_id", sa.UUID(), nullable=False),
        sa.Column("owner_id", sa.UUID(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="INR"),
        sa.Column("method", sa.String(length=30), nullable=False),
        sa.Column("reference_no", sa.String(length=100), nullable=True),
        sa.Column("proof_url", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_by", sa.UUID(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["schedule_id"], ["inspection_schedules.id"]),
        sa.ForeignKeyConstraint(["owner_id"], ["owners.id"]),
        sa.ForeignKeyConstraint(["verified_by"], ["admins.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payments_owner_id"), "payments", ["owner_id"], unique=False)
    op.create_index(op.f("ix_payments_schedule_id"), "payments", ["schedule_id"], unique=False)
    op.create_index(op.f("ix_payments_status"), "payments", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_payments_status"), table_name="payments")
    op.drop_index(op.f("ix_payments_schedule_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_owner_id"), table_name="payments")
    op.drop_table("payments")

