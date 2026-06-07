from routers import auth
from routers import stock
from routers import user
from fastapi import FastAPI

from database import Base
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.include_router(auth.router)
app.include_router(stock.router)
app.include_router(user.router)

target_metadata = Base.metadata

