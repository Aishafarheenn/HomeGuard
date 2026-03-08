"""add report_notes to inspection_reports

Revision ID: a1b2c3d4e5f6
Revises: 646fc028dd27
Create Date: 2026-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "646fc028dd27"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "inspection_reports",
        sa.Column("report_notes", sa.Text(), nullable=True),
    )
    op.alter_column(
        "inspection_reports",
        "report_url",
        existing_type=sa.Text(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "inspection_reports",
        "report_url",
        existing_type=sa.Text(),
        nullable=False,
    )
    op.drop_column("inspection_reports", "report_notes")
