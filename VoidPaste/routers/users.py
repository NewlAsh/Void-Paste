from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import models
from database import get_db
from schemas import UserCreate, UserPublic, UserPrivate, UserUpdate
from fastapi.security import OAuth2PasswordRequestForm  
from sqlalchemy import func
from auth import password_hash, hash_password, CurrentUser, create_access_token, verify_password


router = APIRouter()

@router.post("/", response_model=UserPrivate, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.Users).where(func.lower(models.Users.username) == user.username.lower()))
    existing_user = result.scalars().all()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    
    result = await db.execute(
        select(models.Users).where(func.lower(models.Users.email) == user.email.lower()),
    )

    existing_email = result.scalars().first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    new_user = models.Users(
        username=user.username.lower(),
        email=user.email.lower(),
        password_hash=hash_password(user.password),
        private_account=user.private_account
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user



@router.get("/me", response_model=UserPrivate)
async def get_current_user(current_user: CurrentUser):
    return current_user



@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.Users).where(models.Users.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if user.private_account:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User's account is private"
        )
        
    return user



@router.patch("/me/update/{user_id}", response_model=UserPrivate)
async def update_user(user_id: int, user_update: UserUpdate, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorised",
        )
    
    result = await db.execute(select(models.Users).where(models.Users.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user_update.username is not None and user_update.username.lower() != user.username.lower():
        result = await db.execute(
            select(models.Users).where(func.lower(models.Users.username) == user_update.username.lower()),
        )
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
            )
        
    if user_update.email is not None and user_update.email.lower() != user.email.lower():
        result = await db.execute(
            select(models.Users).where(func.lower(models.Users.email) == user_update.email.lower()),
        )
        existing_email = result.scalars().first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.email is not None:
        user.email = user_update.email.lower()
    
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    # 1. Look up the user by username (case-insensitive)
    result = await db.execute(
        select(models.Users).where(func.lower(models.Users.username) == form_data.username.lower())
    )
    user = result.scalars().first()
    
    # 2. Verify user existence and check the password hash
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create the JWT token containing the user's ID as the subject ("sub")
    # Cast the int ID to a string since JWT specs expect strings for subjects
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=None # Drops back to your 30-minute config default
    )
    
    # 4. Return exactly what OAuth2 expects: access_token and token_type
    return {"access_token": access_token, "token_type": "bearer"}



@router.delete("/me/delete/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.Users).where(models.Users.id == user_id))
    user = result.scalars().first()

    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorised to delete",
        )
    result = await db.execute(select(models.Users).where(models.Users.id == user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    
    await db.delete(user)
    await db.commit()