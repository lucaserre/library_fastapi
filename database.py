from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


DATABASE_PATH = os.path.join(BASE_DIR, "dados", "biblioteca.db")


os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)


SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()