#database.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./voidPaste.db"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)


#initiating the conversation with database (this shit aint tuff)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# #async with engine.begin() as conn:
#         # await conn.run_sync(Base.metadata.create_all)



# from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
# from sqlalchemy.orm import DeclarativeBase

# SQLALCHEMY_DATABASE_URL_2 = "sqlite+aiosqlite:///./voidPaste.db"
# engine_2 = create_async_engine(SQLALCHEMY_DATABASE_URL_2, connect_args={"check_same_thread": False},)
# AsyncSessionLocal_2 = async_sessionmaker(engine_2, class_=AsyncSession, expire_on_commit=False)

# class Base(DeclarativeBase):
#     pass

# async def get_db():
#     async with 