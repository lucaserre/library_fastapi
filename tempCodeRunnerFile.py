from fastapi import FastAPI
from pydantic import BaseModel
from enum import Enum


class Item(BaseModel):
    
    id: int
    name: str
    price: float
    amount: int

database = []

app = FastAPI()


@app.post("/products/")
async def add_product(item: Item):
    item_dict = item.model_dump()

    database.append(item_dict)

    return {"product_id": item.id, "product_name": item.name, "product_price": item.price, "product_amount": item.amount}


@app.get("/products/")
async def products_query():
    return {"lista": database}

@app.delete("/products/{product_id}")
async def products_del(product_id:int):
        for item in database:
            if item["id"] == product_id:
                database.remove(item)
   
                return {f"O item {product_id} foi removido."}
            
@app.put("/products/{product_id}")
async def change_products(product_id:int, item:Item):