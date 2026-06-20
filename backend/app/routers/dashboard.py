from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    active_products = db.query(Product).filter(
        Product.is_active == True
    ).count()

    total_customers = db.query(Customer).count()

    active_customers = db.query(Customer).filter(
        Customer.is_active == True
    ).count()

    total_orders = db.query(Order).count()

    pending_orders = db.query(Order).filter(
        Order.status == "pending"
    ).count()

    cancelled_orders = db.query(Order).filter(
        Order.status == "cancelled"
    ).count()

    low_stock_products = db.query(Product).filter(
        Product.quantity <= Product.minimum_stock,
        Product.is_active == True
    ).count()

    return {
        "success": True,
        "data": {
            "total_products": total_products,
            "active_products": active_products,

            "total_customers": total_customers,
            "active_customers": active_customers,

            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "cancelled_orders": cancelled_orders,

            "low_stock_products": low_stock_products
        }
    }