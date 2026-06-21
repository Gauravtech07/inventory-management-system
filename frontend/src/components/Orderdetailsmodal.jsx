import { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";

import api from "../services/api";
import LoadingSpinner from "../components/Loadingspinner";
import StatusBadge from "./Statusbadge";

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function OrderDetailsModal({ show, orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !orderId) return;

        const loadOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.data);
            } catch (err) {
                setError(err.normalizedMessage || "Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [show, orderId]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">
                    Order Details {order && `#${order.id}`}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading && <LoadingSpinner label="Loading order..." />}

                {!loading && error && <div className="text-danger">{error}</div>}

                {!loading && !error && order && (
                    <>
                        <div className="row mb-3">
                            <div className="col-6">
                                <div className="text-muted small">Customer</div>
                                <div className="fw-semibold">{order.customer_name}</div>
                            </div>
                            <div className="col-3">
                                <div className="text-muted small">Status</div>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="col-3">
                                <div className="text-muted small">Date</div>
                                <div>{formatDate(order.created_at)}</div>
                            </div>
                        </div>

                        <Table size="sm" className="align-middle">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.product_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(item.price)}</td>
                                        <td>{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <div className="d-flex justify-content-end pt-2 border-top">
                            <span className="fs-5 fw-bold">
                                Total: {formatCurrency(order.total_amount)}
                            </span>
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderDetailsModal;