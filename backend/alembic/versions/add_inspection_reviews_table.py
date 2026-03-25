"""add inspection_reviews for owner ratings and admin replies

Revision ID: add_insp_reviews
Revises: make_jt_insp_null
Create Date: 2026-03-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_insp_reviews"
down_revision: Union[str, None] = "make_jt_insp_null"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inspection_reviews",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("inspection_id", sa.UUID(), nullable=False),
        sa.Column("owner_id", sa.UUID(), nullable=False),
        sa.Column("inspector_id", sa.UUID(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("admin_reply", sa.Text(), nullable=True),
        sa.Column("admin_reply_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["inspection_id"], ["inspections.id"]),
        sa.ForeignKeyConstraint(["owner_id"], ["owners.id"]),
        sa.ForeignKeyConstraint(["inspector_id"], ["inspector.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("inspection_id"),
    )
    op.create_index(op.f("ix_inspection_reviews_owner_id"), "inspection_reviews", ["owner_id"], unique=False)
    op.create_index(op.f("ix_inspection_reviews_inspector_id"), "inspection_reviews", ["inspector_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_inspection_reviews_inspector_id"), table_name="inspection_reviews")
    op.drop_index(op.f("ix_inspection_reviews_owner_id"), table_name="inspection_reviews")
    op.drop_table("inspection_reviews")
