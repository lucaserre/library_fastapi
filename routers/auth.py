import models
from schemas import UserCreate, Token
from security import get_db, get_password_hash, authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, limiter
from datetime import timedelta
from typing import Annotated
from fastapi import Depends, APIRouter, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session


router = APIRouter()

@router.post("/register", tags=["users"])
async def new_user(new_register: UserCreate,  db: Session = Depends(get_db)):
    
    
    save_hashed_password = get_password_hash(new_register.password)
    db_user = models.User(name = new_register.name, username = new_register.username, email = new_register.email, hashed_password = save_hashed_password )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post("/token")
@limiter.limit("5/minute")
async def login_for_access_token(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
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