from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

def get_product_or_404(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    existing_product = db.query(Product).filter(
        Product.sku == product.sku
    ).first()

    if existing_product:
        raise HTTPException(
            status_code=409,
            detail="SKU already exists"
        )

    new_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity,
        minimum_stock=product.minimum_stock
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product





@router.get("/")
def get_products(
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
    search: str = None,
    is_active: bool = None,
    low_stock: bool = False
):
    try:
        # validation
        if page <= 0:
            raise HTTPException(status_code=400, detail="Page must be > 0")

        if page_size > 100:
            raise HTTPException(status_code=400, detail="Page size too large")

        skip = (page - 1) * page_size

        # base query
        query = db.query(Product)

        # SEARCH FILTER
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%")
                )
            )

        # ACTIVE FILTER
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        # LOW STOCK FILTER
        if low_stock:
            query = query.filter(Product.quantity <= Product.minimum_stock)

        # total count (before pagination)
        total = query.count()

        # pagination
        products = query.offset(skip).limit(page_size).all()

        return {
            "success": True,
            "message": "Products fetched successfully",
            "data": products,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size
            }
        }

    except Exception:
     raise HTTPException(
        status_code=500,
        detail="Something went wrong. Please try again later."
    )
    


@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product_or_404(db, product_id)

    return {
        "success": True,
        "data": product
    }
    
    
@router.put("/{product_id}")
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = get_product_or_404(db, product_id)

    # SKU check
    if product_data.sku != product.sku:
        existing = db.query(Product).filter(
            Product.sku == product_data.sku
        ).first()

        if existing:
            raise HTTPException(status_code=409, detail="SKU already exists")

    product.name = product_data.name
    product.sku = product_data.sku
    product.price = product_data.price
    product.quantity = product_data.quantity
    product.minimum_stock = product_data.minimum_stock
    product.is_active = product_data.is_active

    db.commit()
    db.refresh(product)

    return {
        "success": True,
        "message": "Product updated",
        "data": product
    }
    
    
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product_or_404(db, product_id)

    product.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Product deleted successfully"
    }
    
    