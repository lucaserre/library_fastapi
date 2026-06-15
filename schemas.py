from pydantic import BaseModel
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    
    name: str
    username: str
    email: str
    password: str

class ItemSchema(BaseModel):
    id: int
    name: str
    author: str
    genre: str
    rating: float
    price: float
    cover_url: str | None

class BookReadCreate(BaseModel):
    name: str
    author: str | None = None
    genre: str | None = None
    rating: int | None = None
    review: str | None = None
    cover_url: str | None
    finished_in: datetime 

class BookReadResponse(BaseModel):
    name: str
    author: str | None = None
    genre: str | None = None
    rating: int | None = None
    review: str | None = None
    finished_in: datetime 

class UserStatsResponse(BaseModel):
    total_books_read: int
    media_books_rating: float
    favorite_author: str | None
