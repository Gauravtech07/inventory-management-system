from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# Create Customer
class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)


# Update Customer
class CustomerUpdate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    is_active: bool = True


# Response Model
class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Paginated Response (Optional but Professional)
class CustomerListResponse(BaseModel):
    success: bool
    message: str
    data: list[CustomerResponse]
    pagination: dict