from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.inspector import schemas as inspector_schemas
from app.inspector import services as inspector_services
from auth.dependencies import (
    CurrentUser,
    get_current_admin,
    get_current_inspector,
)
from middleware.db import get_db

router = APIRouter(prefix="/inspectors", tags=["inspectors"])


@router.get("", response_model=list[inspector_schemas.InspectorResponse])
def get_all_inspectors(
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: list all inspectors."""
    try:
        return inspector_services.get_all_inspectors(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/me", response_model=inspector_schemas.InspectorResponse)
def get_me(
    db: Session = Depends(get_db),
    current_inspector: CurrentUser = Depends(get_current_inspector),
):
    """Inspector: get own profile. Declared before /{inspector_id} so `/me` is not parsed as UUID."""
    try:
        return inspector_services.get_inspector_by_id(current_inspector.user_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/{inspector_id}/profile",
    response_model=inspector_schemas.InspectorProfileResponse,
)
def get_inspector_profile(
    inspector_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: inspector details, job summary, and owner ratings."""
    try:
        return inspector_services.get_inspector_profile_for_admin(inspector_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{inspector_id}", response_model=inspector_schemas.InspectorResponse)
def get_inspector(
    inspector_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        return inspector_services.get_inspector_by_id(inspector_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "", response_model=inspector_schemas.InspectorResponse, status_code=status.HTTP_201_CREATED
)
def create_inspector(
    inspector_data: inspector_schemas.InspectorCreate,
    db: Session = Depends(get_db),
):
    """Public endpoint for inspector registration."""
    try:
        return inspector_services.create_inspector(inspector_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/{inspector_id}", response_model=inspector_schemas.InspectorResponse)
def update_inspector(
    inspector_id: UUID,
    inspector_data: inspector_schemas.InspectorUpdate,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        inspector = inspector_services.update_inspector(
            inspector_id, inspector_data, db
        )
        if not inspector:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found"
            )
        return inspector
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.patch("/{inspector_id}/approve", response_model=inspector_schemas.InspectorResponse)
def approve_inspector(
    inspector_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: approve inspector so they can log in."""
    inspector = inspector_services.approve_inspector(
        inspector_id, current_admin.user_id, db
    )
    if not inspector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found"
        )
    return inspector


@router.patch("/{inspector_id}/reject", response_model=inspector_schemas.InspectorResponse)
def reject_inspector(
    inspector_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    """Admin only: reject inspector."""
    inspector = inspector_services.reject_inspector(inspector_id, db)
    if not inspector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found"
        )
    return inspector


@router.delete("/{inspector_id}")
def delete_inspector(
    inspector_id: UUID,
    db: Session = Depends(get_db),
    current_admin: CurrentUser = Depends(get_current_admin),
):
    try:
        result = inspector_services.delete_inspector(inspector_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Inspector not found"
            )
        return {"message": "Inspector deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
