"""add owner and admin response fields to complaint

Revision ID: complaint_owner_resp
Revises: payments_manual_table
Create Date: 2026-03-26
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "complaint_owner_resp"
down_revision: Union[str, None] = "payments_manual_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("Complaint", sa.Column("owner_id", sa.UUID(), nullable=True))
    op.add_column("Complaint", sa.Column("admin_response", sa.Text(), nullable=True))
    op.add_column("Complaint", sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("Complaint", sa.Column("responded_by", sa.UUID(), nullable=True))

    op.create_index(op.f("ix_Complaint_owner_id"), "Complaint", ["owner_id"], unique=False)
    op.create_foreign_key(None, "Complaint", "owners", ["owner_id"], ["id"])
    op.create_foreign_key(None, "Complaint", "admins", ["responded_by"], ["id"])

    # Backfill owner_id using email match for existing rows if possible.
    op.execute(
        """
        UPDATE "Complaint" c
        SET owner_id = o.id
        FROM owners o
        WHERE c.owner_id IS NULL
          AND lower(c.email) = lower(o.email)
        """
    )

    # If any row still has null owner_id, remove it to keep strict owner-only complaints.
    op.execute('DELETE FROM "Complaint" WHERE owner_id IS NULL')

    op.alter_column("Complaint", "owner_id", nullable=False)


def downgrade() -> None:
    op.drop_constraint(None, "Complaint", type_="foreignkey")
    op.drop_constraint(None, "Complaint", type_="foreignkey")
    op.drop_index(op.f("ix_Complaint_owner_id"), table_name="Complaint")
    op.drop_column("Complaint", "responded_by")
    op.drop_column("Complaint", "responded_at")
    op.drop_column("Complaint", "admin_response")
    op.drop_column("Complaint", "owner_id")

