#database.py
import os
import urllib.parse
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

# engine = create_async_engine(
#     SQLALCHEMY_DATABASE_URL,
#     connect_args={"check_same_thread": False},
# )
load_dotenv()
raw_passcode = os.getenv("DB_PASSCODE")
db_name = os.getenv("DB_NAME")

encoded_passcode  = urllib.parse.quote_plus(raw_passcode)

SQLALCHEMY_DATABASE_URL = f"postgresql+asyncpg://postgres:{encoded_passcode}@localhost:5432/{db_name}"

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)


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
