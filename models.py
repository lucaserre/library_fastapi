from __future__ import annotations
from database import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, ForeignKey, Float
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from typing import Optional
from typing import List
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

class Item(Base):
    __tablename__ = "items"

   
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    gender: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Float)

class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column (String(30))
    fullname: Mapped[str|None] = mapped_column()
    username: Mapped[str|None] = mapped_column(String(64))
    email: Mapped[str|None] = mapped_column(String(64))
    hashed_password: Mapped[str] = mapped_column(String(255))

    books_read: Mapped[list[Books_Read]] = relationship(back_populates="user")

class Books_Read(Base):
    __tablename__ = "books_read"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id") )
    name: Mapped[str] = mapped_column(String(50))
    author: Mapped[str | None] = mapped_column(String(50))
    gender: Mapped[str | None] = mapped_column(String(100))
    rating: Mapped[int | None] = mapped_column(Integer)
    review: Mapped[str | None] = mapped_column(String(1000))
    finished_in: Mapped[datetime] = mapped_column()

    user: Mapped[User] = relationship(back_populates="books_read")
    