"""make job_ticket inspector_id nullable for pending assignment

Revision ID: make_jt_insp_null
Revises: add_report_notes_to_inspection_reports
Create Date: 2026-03-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "make_jt_insp_null"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "job_tickets",
        "inspector_id",
        existing_type=sa.UUID(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "job_tickets",
        "inspector_id",
        existing_type=sa.UUID(),
        nullable=False,
    )
