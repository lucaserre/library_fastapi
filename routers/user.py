from services import upload_image_to_s3
import uuid
import models
import logging
import os
from security import get_current_user, get_db
from schemas import BookReadCreate, BookReadResponse, UserStatsResponse, ItemSchema
from fastapi import Depends , HTTPException, APIRouter, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func


router = APIRouter()

@router.get("/library/books-read/recommendations", response_model=list[ItemSchema])
async def get_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    favorite_author = db.query(models.Books_Read.author).filter(models.Books_Read.user_id == current_user.id).group_by(models.Books_Read.author).order_by(func.count().desc()).limit(1).scalar()

    if favorite_author is None:
       
        return [] 
        
    
    query_read_books_names = db.query(models.Books_Read.name).filter(models.Books_Read.user_id == current_user.id)
    
    
    recommended_books = db.query(models.Item).filter(
        models.Item.author.ilike(f"%{favorite_author}%"), 
        ~models.Item.name.in_(query_read_books_names)
    ).limit(3).all()
    
    return recommended_books
    

@router.get("/library/books-read/stats", response_model=UserStatsResponse)
async def books_read_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_books= db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id).count()
    average_rating = db.query(func.coalesce(func.avg(models.Books_Read.rating), 0.0)).filter(models.Books_Read.user_id == current_user.id).scalar()
    authors_read = db.query(models.Books_Read.author).filter(models.Books_Read.user_id == current_user.id).group_by(models.Books_Read.author).order_by(func.count().desc()).limit(1).scalar()


    return {
        "total_books_read": total_books ,
        "media_books_rating": average_rating ,
        "favorite_author": authors_read 


    }

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
async def my_book(new_reading: BookReadCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    db_books_read = models.Books_Read(
        user_id=current_user.id, 
        name=new_reading.name,
        author=new_reading.author,
        genre=new_reading.genre,
        rating=new_reading.rating,
        review=new_reading.review,
        cover_url=new_reading.cover_url,
        finished_in=new_reading.finished_in
    )

    db.add(db_books_read)
    db.commit()
    db.refresh(db_books_read)

    return db_books_read



@router.post("/library/books-read/{book_id}/cover")
async def my_books_image(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user), file: UploadFile | None = None):

    allow_formats = ["image/jpeg", "image/png", "image/jpg", "image/png", "image/svg", "image/webp"]

    logger = logging.getLogger(__name__)
    
    unique_name = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"


    upload_image_client = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id, models.Books_Read.id == book_id).first()


    


    if upload_image_client is None:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    
    if not file:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado")
    
    if file.content_type not in allow_formats:
        raise HTTPException(status_code=400, detail="Formato de arquivo não suportado")
    
    if file.size > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Payload Too Large")
    
    
    file_bytes = await file.read()

    try: 
        s3_url = await upload_image_to_s3(file_bytes, unique_name, file.content_type)

    except Exception as error:
       
        logger.error(f"Error uploading to S3: {str(error)}", exc_info=True)
       
        raise  HTTPException(status_code=500, detail="Internal Server Error")
    
    upload_image_client.cover_url = s3_url
    db.commit()
    db.refresh(upload_image_client)
    
    return upload_image_client

@router.put("/library/books-read/{book_id}")
async def update_my_book(book_id: int, item: BookReadCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    my_book = db.query(models.Books_Read).filter(models.Books_Read.user_id == current_user.id, models.Books_Read.id == book_id).first()
    
    if not my_book :
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
        
    my_book.name = item.name
    my_book.author = item.author
    my_book.genre = item.genre
    my_book.rating = item.rating
    my_book.review = item.review
    my_book.finished_in = item.finished_in

    db.commit() 
    db.refresh(my_book)

    return {"message": "Alteração realizada com sucesso", "book": my_book}