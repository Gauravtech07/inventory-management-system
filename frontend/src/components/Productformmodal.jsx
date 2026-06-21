import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

import api from "../services/api";

const emptyForm = {
    name: "",
    sku: "",
    price: "",
    quantity: "",
    minimum_stock: "",
    is_active: true
};

function validate(form) {
    const errors = {};

    if (!form.name.trim()) errors.name = "Product name is required";

    if (!form.sku.trim()) errors.sku = "SKU is required";

    if (form.price === "" || Number.isNaN(Number(form.price))) {
        errors.price = "Enter a valid price";
    } else if (Number(form.price) <= 0) {
        errors.price = "Price must be greater than 0";
    }

    if (form.quantity === "" || Number.isNaN(Number(form.quantity))) {
        errors.quantity = "Enter a valid quantity";
    } else if (Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity))) {
        errors.quantity = "Quantity must be a whole number, 0 or more";
    }

    if (form.minimum_stock === "" || Number.isNaN(Number(form.minimum_stock))) {
        errors.minimum_stock = "Enter a valid minimum stock level";
    } else if (Number(form.minimum_stock) < 0 || !Number.isInteger(Number(form.minimum_stock))) {
        errors.minimum_stock = "Minimum stock must be a whole number, 0 or more";
    }

    return errors;
}

/**
 * product = null -> "Add Product" mode
 * product = {...} -> "Edit Product" mode
 */
function ProductFormModal({ show, product, onClose, onSuccess }) {
    const isEdit = Boolean(product);

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        if (show) {
            setForm(
                product
                    ? {
                        name: product.name ?? "",
                        sku: product.sku ?? "",
                        price: product.price ?? "",
                        quantity: product.quantity ?? "",
                        minimum_stock: product.minimum_stock ?? "",
                        is_active: product.is_active ?? true
                    }
                    : emptyForm
            );
            setErrors({});
            setApiError(null);
        }
    }, [show, product]);

    const handleChange = (field) => (e) => {
        const value = field === "is_active" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        setApiError(null);

        const payload = {
            name: form.name.trim(),
            sku: form.sku.trim(),
            price: Number(form.price),
            quantity: Number(form.quantity),
            minimum_stock: Number(form.minimum_stock),
            ...(isEdit ? { is_active: form.is_active } : {})
        };

        try {
            if (isEdit) {
                await api.put(`/products/${product.id}`, payload);
                onSuccess("Product updated successfully");
            } else {
                await api.post("/products/", payload);
                onSuccess("Product added successfully");
            }
        } catch (error) {
            setApiError(error.normalizedMessage || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={submitting ? undefined : onClose} centered>
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Header closeButton={!submitting}>
                    <Modal.Title className="fs-5">
                        {isEdit ? "Edit Product" : "Add Product"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {apiError && <Alert variant="danger" className="py-2">{apiError}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            value={form.name}
                            onChange={handleChange("name")}
                            isInvalid={Boolean(errors.name)}
                            placeholder="e.g. Wireless Mouse"
                            disabled={submitting}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>SKU</Form.Label>
                        <Form.Control
                            value={form.sku}
                            onChange={handleChange("sku")}
                            isInvalid={Boolean(errors.sku)}
                            placeholder="e.g. WM-1023"
                            disabled={submitting}
                        />
                        <Form.Control.Feedback type="invalid">{errors.sku}</Form.Control.Feedback>
                    </Form.Group>

                    <div className="row">
                        <Form.Group className="col-6 mb-3">
                            <Form.Label>Price (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange("price")}
                                isInvalid={Boolean(errors.price)}
                                disabled={submitting}
                            />
                            <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="col-6 mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                value={form.quantity}
                                onChange={handleChange("quantity")}
                                isInvalid={Boolean(errors.quantity)}
                                disabled={submitting}
                            />
                            <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Minimum Stock Level</Form.Label>
                        <Form.Control
                            type="number"
                            value={form.minimum_stock}
                            onChange={handleChange("minimum_stock")}
                            isInvalid={Boolean(errors.minimum_stock)}
                            disabled={submitting}
                        />
                        <Form.Text muted>Used to flag this product as "Low Stock" on the dashboard.</Form.Text>
                        <Form.Control.Feedback type="invalid">{errors.minimum_stock}</Form.Control.Feedback>
                    </Form.Group>

                    {isEdit && (
                        <Form.Check
                            type="switch"
                            label="Active"
                            checked={form.is_active}
                            onChange={handleChange("is_active")}
                            disabled={submitting}
                        />
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                        {isEdit ? "Save Changes" : "Add Product"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ProductFormModal;