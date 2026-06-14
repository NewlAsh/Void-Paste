#clips.py

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import models
from database import get_db
from schemas import ClipCreate, ClipResponse, ClipUpdate
from auth import CurrentUser

router = APIRouter()


@router.post(
    "",
    response_model=ClipResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_clip(post: ClipCreate, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    
    new_clip = models.Clips(
        title=post.title,
        content=post.content,
        user_id=current_user.id,
    )
    db.add(new_clip)
    await db.commit()
    await db.refresh(new_clip, attribute_names=["author"])
    return new_clip


@router.get("/{clips_id}", response_model=ClipResponse)
async def get_clip(clips_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(models.Clips)
        .options(selectinload(models.Clips.author))
        .where(models.Clips.id == clips_id),
    )
    post = result.scalars().first()
    if post:
        return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")



@router.patch("/update/clip/{clip_id}", response_model=ClipResponse)
async def update_clip(post_data: ClipUpdate, clip_id: int, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(models.Clips)
        .options(selectinload(models.Clips.author))
        .where(models.Clips.id == clip_id)
    )
    clip = result.scalars().first()
    if not clip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clip not found",
        )
    
    if clip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clip not found",
        )
    
    update_data = post_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(clip, field, value)

    await db.commit()
    await db.refresh(clip, attribute_names=["author"])
    return clip


@router.delete("/delete/clip/{clip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(clip_id: int, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(models.Clips).where(models.Clips.id == clip_id))
    clip = result.scalars().first()
    if not clip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    
    if clip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )


    await db.delete(clip)
    await db.commit()


@router.get("/user/clips/{user_id}", response_model=list[ClipResponse])
async def get_user_clips(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    # Fetch all clips for this user id with author preloaded, ordered by newest first
    result = await db.execute(
        select(models.Clips)
        .options(selectinload(models.Clips.author))
        .where(models.Clips.user_id == user_id)
        .order_by(models.Clips.date_posted.desc())
    )
    clips = result.scalars().all()
    return clips