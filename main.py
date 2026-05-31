from datetime import datetime, timedelta, timezone
from typing import Annotated

import os
import jwt
import models
from fastapi import Depends ,FastAPI, HTTPException, status
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from enum import Enum
from pwdlib import PasswordHash
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base

from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

fake_users_db = {
    "lucasr": {
        "username": "lucasr",
        "full_name": "Lucas Rabelo",
        "email": "lucaserre@example.com",
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$wagCPXjifgvUFBzq4hqe3w$z9+BhVFYH+4rKNs2ywcbLi8zmsLAoC5V+7pPIx1WOvY",
        "disabled": False,
    }
}

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30


database = []

app = FastAPI()


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

class ItemSchema(BaseModel):
    id: int
    name: str
    gender: str
    price: float

class UserInDB(User):
    hashed_password: str





oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "token")
password_hash = PasswordHash.recommended()

DUMMY_HASH = password_hash.hash("dummypassword")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_hash.hash(password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
                
def authenticate_user(database, username: str, password: str):
    user = get_user(database, username)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.post("/library/")
async def new_book(token: Annotated[str, Depends(oauth2_scheme)] ,item: ItemSchema, db: Session = Depends(get_db)):
    
    db_book = models.Item(**item.model_dump())
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)

    return db_book

@app.get("/library/{book_id}")
async def see_book(token: Annotated[str, Depends(oauth2_scheme)] ,book_id: int, db: Session = Depends(get_db)):
    
    db_book = db.query(models.Item).filter(models.Item.id == book_id).first()
    
    if db_book is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return db_book

@app.delete("/library/{book_id}")
async def delete_book(token: Annotated[str, Depends(oauth2_scheme)] ,book_id: int, db: Session = Depends(get_db)):
    
    my_book = db.query(models.Item).filter(models.Item.id == book_id).first()

    if not my_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    db.delete(my_book)
    db.commit() 
                
    return {"message": f"Item {book_id} removido com sucesso"}
        
@app.put("/library/{book_id}")
async def update_book(token: Annotated[str, Depends(oauth2_scheme)], book_id: int, item: ItemSchema, db: Session = Depends(get_db), ):
    
    my_book = db.query(models.Item).filter(models.Item.id == book_id).first()

    if not my_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    
    my_book.id = item.id
    my_book.name = item.name
    my_book.gender = item.gender
    my_book.price = item.price

    db.commit() 
    db.refresh(my_book)

    return {"message": "Alteração realizada com sucesso", "book": my_book}