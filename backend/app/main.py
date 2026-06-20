from fastapi import FastAPI

from app.database import Base, engine

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

from app.routers.product import router as product_router
from app.routers.customer import router as customer_router
from app.routers.order import router as order_router
from app.routers.dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management API"
)

app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "Inventory API Running"}