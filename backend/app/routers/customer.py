from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

def get_customer_or_404(db: Session, customer_id: int):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer



@router.post("/")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    existing_customer = db.query(Customer).filter(
        Customer.email == customer.email
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    new_customer = Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return {
        "success": True,
        "message": "Customer created successfully",
        "data": new_customer
    }
    
    
@router.get("/")
def get_customers(
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
    search: str = None,
    is_active: bool = None
):

    if page <= 0:
        raise HTTPException(
            status_code=400,
            detail="Page must be greater than 0"
        )

    if page_size > 100:
        raise HTTPException(
            status_code=400,
            detail="Page size cannot exceed 100"
        )

    skip = (page - 1) * page_size

    query = db.query(Customer)

    if search:
        query = query.filter(
            or_(
                Customer.full_name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%")
            )
        )

    if is_active is not None:
        query = query.filter(
            Customer.is_active == is_active
        )

    total = query.count()

    customers = query.offset(skip).limit(page_size).all()

    return {
        "success": True,
        "message": "Customers fetched successfully",
        "data": customers,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    }
    
@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = get_customer_or_404(
        db,
        customer_id
    )

    return {
        "success": True,
        "data": customer
    }
    
    
@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db)
):

    customer = get_customer_or_404(
        db,
        customer_id
    )

    if customer.email != customer_data.email:

        existing_customer = db.query(Customer).filter(
            Customer.email == customer_data.email
        ).first()

        if existing_customer:
            raise HTTPException(
                status_code=409,
                detail="Email already exists"
            )

    customer.full_name = customer_data.full_name
    customer.email = customer_data.email
    customer.phone = customer_data.phone
    customer.is_active = customer_data.is_active

    db.commit()
    db.refresh(customer)

    return {
        "success": True,
        "message": "Customer updated successfully",
        "data": customer
    }
    
    
@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = get_customer_or_404(
        db,
        customer_id
    )

    customer.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Customer deleted successfully"
    }