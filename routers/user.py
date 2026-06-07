import models
from security import get_current_user, get_db
from schemas import BookReadCreate, BookReadResponse
from fastapi import Depends , HTTPException, APIRouter
from sqlalchemy.orm import Session


router = APIRouter()

@router.get("/library/books-read/", response_model=list[BookReadResponse])
async def visualize_my_books (db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    my_collection = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id).all()

    return my_collection

@router.delete("/library/books-read/{book_id}")
async def delete_my_reading(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    my_read_book = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id, models.Books_Read.id == book_id).first()

    if not my_read_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    db.delete(my_read_book)
    db.commit() 

    return {"message": f"Livro Removido"}

@router.post("/library/books-read")
async def my_book(new_reading: BookReadCreate,current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    
    db_books_read = models.Books_Read(user_id = current_user.id, name = new_reading.name, finished_in = new_reading.finished_in)

   

    db.add(db_books_read)
    db.commit()
    db.refresh(db_books_read)

    return db_books_read