from pydantic import BaseModel, Field
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    minimum_stock: int = Field(default=5, ge=0)


class ProductUpdate(BaseModel):
    name: str
    sku: str
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    minimum_stock: int = Field(default=5, ge=0)
    is_active: bool = True


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    quantity: int
    minimum_stock: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True