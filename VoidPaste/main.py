#main.py
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import Annotated

from database import Base, engine
from routers import clips, users
from fastapi.middleware.cors import CORSMiddleware  # add this
from fastapi import Request
from middleware import bot_blocker_middleware, rate_limiter_middleware
from schemas import ClipResponse
from database import get_db
import models

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup: Create tables automatically before the app starts taking traffic
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield 
    # Shutdown: Clean up connection pool state completely
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

@app.middleware("http")
async def register_bot_blocker(request, call_next):
    return await bot_blocker_middleware(request, call_next)

@app.middleware("http")
async def rate_limiter_tracker(request: Request, call_next):
    return await rate_limiter_middleware(request, call_next)

# Add this block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers mounting
app.include_router(users.router, prefix="/api/users", tags=["users"])
# Fixed: Swapped prefix from /api/posts to /api/clips to match your code naming convention
app.include_router(clips.router, prefix="/api/clips", tags=["clips"])


@app.get("/", response_model=list[ClipResponse], name="get all public posts", include_in_schema=False)
async def get_all_public_posts(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(models.Clips)
        .join(models.Users, models.Clips.user_id == models.Users.id)
        .options(selectinload(models.Clips.author))
        .where(models.Users.private_account == False)
        .order_by(models.Clips.date_posted.desc())
        )
    
    clips = result.scalars().all()

    return clips