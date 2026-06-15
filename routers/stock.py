import models
from fastapi import Depends , APIRouter
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi import Depends, HTTPException, UploadFile
from schemas import ItemSchema
from security import oauth2_scheme, get_db, get_current_user
from services import upload_image_to_s3


router = APIRouter(prefix="/library", tags=["stock"])

@router.get("/books")
async def visualize_books (db: Session = Depends(get_db), skip: int = 0, limit: int = 10):

    books_storage =  db.query(models.Item).offset(skip).limit(limit).all()

    return books_storage


@router.post("/{book_id}/cover")
async def books_image(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user), file: UploadFile | None = None):

    upload_image_client = db.query(models.Item).filter(models.Books_Read.user_id == current_user.id, models.Item.id == book_id).first()

    if upload_image_client is None:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    if not file:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado")

    file_bytes = await file.read()
    s3_url = await upload_image_to_s3(file_bytes, file.filename, file.content_type)
    
    upload_image_client.cover_url = s3_url
    db.commit()
    db.refresh(upload_image_client)
    
    return upload_image_client


@router.post("")
async def new_book(token: Annotated[str, Depends(oauth2_scheme)],item: ItemSchema, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    db_book = models.Item(**item.model_dump()).filter(models.Books_Read.user_id == current_user.id)
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)

    return db_book

@router.get("/{book_id}")
async def see_book(token: Annotated[str, Depends(oauth2_scheme)] ,book_id: int, db: Session = Depends(get_db)):
    
    db_book = db.query(models.Item).filter(models.Item.id == book_id).first()
    
    if db_book is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return db_book

@router.delete("/{book_id}")
async def delete_book(token: Annotated[str, Depends(oauth2_scheme)] ,book_id: int, db: Session = Depends(get_db)):
    
    my_book = db.query(models.Item).filter(models.Item.id == book_id).first()

    if not my_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    db.delete(my_book)
    db.commit() 
                
    return {"message": f"Item {book_id} removido com sucesso"}

@router.put("/{book_id}")
async def update_book(token: Annotated[str, Depends(oauth2_scheme)], book_id: int, item: ItemSchema, db: Session = Depends(get_db)):
    
    my_book = db.query(models.Item).filter(models.Item.id == book_id).first()

    if not my_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    
    my_book.id = item.id
    my_book.name = item.name
    my_book.genre = item.genre
    my_book.price = item.price

    db.commit() 
    db.refresh(my_book)

    return {"message": "Alteração realizada com sucesso", "book": my_book}
