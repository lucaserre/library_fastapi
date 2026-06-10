import models
from security import get_current_user, get_db
from schemas import BookReadCreate, BookReadResponse
from fastapi import Depends , HTTPException, APIRouter
from sqlalchemy.orm import Session


router = APIRouter()


@router.get("/library/books-read/{book_id}", response_model=BookReadResponse)
async def search_a_book (book_id: int, db:Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query_book = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id, models.Books_Read.id == book_id).first()

    if not query_book:
        raise HTTPException(status_code=404, detail="Not Found")
    
    return query_book


@router.get("/library/books-read/", response_model=list[BookReadResponse])
async def visualize_my_books (db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user), search: str | None = None, skip: int = 0, limit: int = 10):

    my_collection = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id)    

    if search:
        my_collection = my_collection.filter(models.Books_Read.name.ilike(f"%{search}%"))
    
    collection_result = my_collection.offset(skip).limit(limit).all()
    

    return collection_result

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

@router.put("/library/books-read/{book_id}")
async def update_my_book(book_id: int, item: BookReadCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    my_book = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id, models.Books_Read.id == book_id).first()

    if not my_book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    
    
    my_book.name = item.name
    my_book.author = item.author
    my_book.gender = item.gender
    my_book.rating = item.rating
    my_book.review = item.review
    my_book.finished_in = item.finished_in

    db.commit() 
    db.refresh(my_book)

    return {"message": "Alteração realizada com sucesso", "book": my_book}