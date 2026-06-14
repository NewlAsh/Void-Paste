#models.py
from __future__ import annotations #for using stuff that aint defined yet (smart tool you know)

from database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from datetime import UTC, datetime


class Users(Base):
    __tablename__ =  "Users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    private_account: Mapped[bool] = mapped_column(nullable=False)

    clips: Mapped[list[Clips]] = relationship(back_populates="author", cascade="all, delete-orphan")


class Clips(Base):
    __tablename__ = "Clips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("Users.id"),
        nullable=False,
        index=True,
    )
    date_posted: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    
    author: Mapped[Users] = relationship(back_populates="clips")

    @property
    def username(self) -> str:
        return self.author.username