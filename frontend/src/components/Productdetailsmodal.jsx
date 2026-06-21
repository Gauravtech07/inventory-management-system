import { Modal, Button } from "react-bootstrap";

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function ProductDetailsModal({ show, product, onClose }) {
    if (!product) return null;

    const isLowStock = product.quantity <= product.minimum_stock;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">Product Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <dl className="row mb-0">
                    <dt className="col-5 text-muted fw-normal">Name</dt>
                    <dd className="col-7">{product.name}</dd>

                    <dt className="col-5 text-muted fw-normal">SKU</dt>
                    <dd className="col-7">{product.sku}</dd>

                    <dt className="col-5 text-muted fw-normal">Price</dt>
                    <dd className="col-7">{formatCurrency(product.price)}</dd>

                    <dt className="col-5 text-muted fw-normal">Quantity in Stock</dt>
                    <dd className="col-7">
                        {product.quantity}
                        {isLowStock && (
                            <span className="badge bg-danger-subtle text-danger ms-2">Low Stock</span>
                        )}
                    </dd>

                    <dt className="col-5 text-muted fw-normal">Minimum Stock Level</dt>
                    <dd className="col-7">{product.minimum_stock}</dd>

                    <dt className="col-5 text-muted fw-normal">Status</dt>
                    <dd className="col-7">
                        <span className={`badge ${product.is_active ? "bg-success" : "bg-secondary"}`}>
                            {product.is_active ? "Active" : "Inactive"}
                        </span>
                    </dd>
                </dl>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProductDetailsModal;