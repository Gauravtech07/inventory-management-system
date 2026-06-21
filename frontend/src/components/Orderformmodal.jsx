import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert, Table } from "react-bootstrap";

import api from "../services/api";

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function OrderFormModal({ show, onClose, onSuccess }) {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [optionsError, setOptionsError] = useState(null);

    const [customerId, setCustomerId] = useState("");
    const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Load active customers + active products whenever the modal opens
    useEffect(() => {
        if (!show) return;

        setCustomerId("");
        setItems([{ product_id: "", quantity: 1 }]);
        setErrors({});
        setApiError(null);

        const loadOptions = async () => {
            setLoadingOptions(true);
            setOptionsError(null);
            try {
                const [customersRes, productsRes] = await Promise.all([
                    api.get("/customers/", { params: { page: 1, page_size: 100, is_active: true } }),
                    api.get("/products/", { params: { page: 1, page_size: 100, is_active: true } })
                ]);
                setCustomers(customersRes.data.data || []);
                setProducts(productsRes.data.data || []);
            } catch (err) {
                setOptionsError(err.normalizedMessage || "Failed to load customers/products");
            } finally {
                setLoadingOptions(false);
            }
        };

        loadOptions();
    }, [show]);

    const productById = (id) => products.find((p) => String(p.id) === String(id));

    const updateItem = (index, field, value) => {
        setItems((current) =>
            current.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    const addItemRow = () => {
        setItems((current) => [...current, { product_id: "", quantity: 1 }]);
    };

    const removeItemRow = (index) => {
        setItems((current) => current.filter((_, i) => i !== index));
    };

    const total = items.reduce((sum, item) => {
        const product = productById(item.product_id);
        const qty = Number(item.quantity) || 0;
        return product ? sum + Number(product.price) * qty : sum;
    }, 0);

    const validate = () => {
        const newErrors = {};

        if (!customerId) newErrors.customerId = "Please select a customer";

        const productIds = items.map((i) => i.product_id).filter(Boolean);
        if (productIds.length === 0) {
            newErrors.items = "Add at least one product";
        } else if (new Set(productIds).size !== productIds.length) {
            newErrors.items = "Each product can only be added once per order";
        }

        items.forEach((item, idx) => {
            if (!item.product_id) {
                newErrors[`item_${idx}`] = "Select a product";
            } else if (!item.quantity || Number(item.quantity) <= 0) {
                newErrors[`item_${idx}`] = "Quantity must be at least 1";
            } else {
                const product = productById(item.product_id);
                if (product && Number(item.quantity) > product.quantity) {
                    newErrors[`item_${idx}`] = `Only ${product.quantity} in stock`;
                }
            }
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        setApiError(null);

        try {
            await api.post("/orders/", {
                customer_id: Number(customerId),
                items: items.map((i) => ({
                    product_id: Number(i.product_id),
                    quantity: Number(i.quantity)
                }))
            });
            onSuccess("Order created successfully");
        } catch (error) {
            setApiError(error.normalizedMessage || "Failed to create order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={submitting ? undefined : onClose} centered size="lg">
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Header closeButton={!submitting}>
                    <Modal.Title className="fs-5">Create Order</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {apiError && <Alert variant="danger" className="py-2">{apiError}</Alert>}

                    {loadingOptions && (
                        <div className="text-center py-4 text-muted">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading customers and products...
                        </div>
                    )}

                    {!loadingOptions && optionsError && (
                        <Alert variant="danger" className="py-2">{optionsError}</Alert>
                    )}

                    {!loadingOptions && !optionsError && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer</Form.Label>
                                <Form.Select
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    isInvalid={Boolean(errors.customerId)}
                                    disabled={submitting}
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.full_name} ({c.email})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.customerId}</Form.Control.Feedback>
                                {customers.length === 0 && (
                                    <Form.Text className="text-danger">
                                        No active customers found. Add a customer first.
                                    </Form.Text>
                                )}
                            </Form.Group>

                            <Form.Label>Order Items</Form.Label>
                            {errors.items && <div className="text-danger small mb-2">{errors.items}</div>}

                            <Table size="sm" className="align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ width: "45%" }}>Product</th>
                                        <th style={{ width: "20%" }}>Qty</th>
                                        <th style={{ width: "25%" }}>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const product = productById(item.product_id);
                                        const subtotal = product ? Number(product.price) * (Number(item.quantity) || 0) : 0;

                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                                                        isInvalid={Boolean(errors[`item_${idx}`])}
                                                        disabled={submitting}
                                                    >
                                                        <option value="">Select product...</option>
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} — {formatCurrency(p.price)} ({p.quantity} in stock)
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                                                        isInvalid={Boolean(errors[`item_${idx}`])}
                                                        disabled={submitting}
                                                    />
                                                </td>
                                                <td className="text-nowrap">{formatCurrency(subtotal)}</td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => removeItemRow(idx)}
                                                        disabled={submitting || items.length === 1}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            {items.some((_, idx) => errors[`item_${idx}`]) && (
                                <div className="text-danger small mb-2">
                                    {items.map((_, idx) => errors[`item_${idx}`]).find(Boolean)}
                                </div>
                            )}

                            <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={addItemRow}
                                disabled={submitting}
                                type="button"
                            >
                                <i className="bi bi-plus-lg me-1"></i> Add Item
                            </Button>

                            <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                                <span className="fs-5 fw-bold">
                                    Total: {formatCurrency(total)}
                                </span>
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting || loadingOptions}>
                        {submitting && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                        Create Order
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default OrderFormModal;