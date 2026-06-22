from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.customer import Customer
from app.models.product import Product

from app.schemas.order import OrderCreate

router = APIRouter(
    prefix="/orders", 
    tags=["Orders"]
)

@router.post("/")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    try:
        customer = db.query(Customer).filter(
            Customer.id == order.customer_id,
            Customer.is_active == True
        ).first()

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        product_ids = [item.product_id for item in order.items]

        if len(product_ids) != len(set(product_ids)):
            raise HTTPException(
                status_code=400,
                detail="Duplicate products are not allowed in an order"
            )

        total_amount = 0

        new_order = Order(
            customer_id=order.customer_id,
            total_amount=0,
            status="pending"
        )

        db.add(new_order)
        db.flush()

        for item in order.items:

            product = db.query(Product).filter(
                Product.id == item.product_id,
                Product.is_active == True
            ).first()

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product ID {item.product_id} not found"
                )

            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}"
                )

            total_amount += float(product.price) * item.quantity

            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )

            db.add(order_item)

            product.quantity -= item.quantity

        new_order.total_amount = total_amount

        db.commit()

        return {
            "success": True,
            "message": "Order created successfully",
            "order_id": new_order.id,
            "total_amount": total_amount
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
    
    
@router.get("/")
def get_orders(
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
    status: str = None,
    customer_id: int = None
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

    query = db.query(Order)
    
    
    allowed_status = [
        "pending",
        "completed",
        "cancelled"
    ]

    if status and status not in allowed_status:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    if status:
        query = query.filter(
            Order.status == status
        )

    if customer_id:
        query = query.filter(
            Order.customer_id == customer_id
        )

    total = query.count()

    orders = query.offset(skip).limit(page_size).all()
 data = []

    for order in orders:
        customer = db.query(Customer).filter(
            Customer.id == order.customer_id
        ).first()

        data.append({
            "id": order.id,
            "customer_name": customer.full_name,
            "mobile": customer.phone,
            "email": customer.email,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at
        })
        
    return {
        "success": True,
        "message": "Orders fetched successfully",
        "data": data,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    }
    
    
@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    customer = db.query(Customer).filter(
        Customer.id == order.customer_id
    ).first()

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    items = []

    for item in order_items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        items.append({
            "product_id": product.id,
            "product_name": product.name,
            "quantity": item.quantity,
            "price": float(item.price)
        })

    return {
        "success": True,
        "data": {
            "id": order.id,
            "customer_id": customer.id,
            "customer_name": customer.full_name,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at,
            "items": items
        }
    }
    
@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Order already cancelled"
        )

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    for item in order_items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if product:
            product.quantity += item.quantity

    order.status = "cancelled"

    db.commit()

    return {
        "success": True,
        "message": "Order cancelled successfully and inventory restored"
    }
