from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.properties import schemas as property_schemas
from app.properties import services as property_services
from auth.dependencies import CurrentUser, get_current_user
from middleware.db import get_db

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[property_schemas.PropertyResponse])
def get_all_properties(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Admin: all properties. Owner: only own properties. Others: all for now."""
    try:
        if current_user.role == "owner":
            return property_services.get_properties_for_owner(current_user.user_id, db)
        return property_services.get_all_properties(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{property_id}", response_model=property_schemas.PropertyResponse)
def get_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        property_obj = property_services.get_property_by_id(property_id, db)
        # Owners can only see their own properties
        if current_user.role == "owner" and property_obj.owner_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to access this property",
            )
        return property_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "", response_model=property_schemas.PropertyResponse, status_code=status.HTTP_201_CREATED
)
def create_property(
    property_data: property_schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Only owners can add properties. They can only create properties for themselves.
    """
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can add properties",
        )
    try:
        property_data.owner_id = current_user.user_id
        return property_services.create_property(property_data, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/{property_id}", response_model=property_schemas.PropertyResponse)
def update_property(
    property_id: UUID,
    property_data: property_schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        existing = property_services.get_property_by_id(property_id, db)
        if current_user.role == "owner" and existing.owner_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to update this property",
            )
        update_dict = property_data.model_dump(exclude_unset=True)
        if current_user.role == "owner":
            update_dict.pop("owner_id", None)
        prop = property_services.update_property(property_id, update_dict, db)
        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
            )
        return prop
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete("/{property_id}")
def delete_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        existing = property_services.get_property_by_id(property_id, db)
        if current_user.role == "owner" and existing.owner_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to delete this property",
            )
        result = property_services.delete_property(property_id, db)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
            )
        return {"message": "Property deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

    