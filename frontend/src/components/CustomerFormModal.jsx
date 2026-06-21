import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

import api from "../services/api";

const emptyForm = { full_name: "", email: "", phone: "" };

function validate(form) {
    const errors = {};

    if (!form.full_name.trim()) errors.full_name = "Full name is required";

    if (!form.email.trim()) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
        errors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
        errors.phone = "Enter a valid phone number";
    }

    return errors;
}

function CustomerFormModal({ show, onClose, onSuccess }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        if (show) {
            setForm(emptyForm);
            setErrors({});
            setApiError(null);
        }
    }, [show]);

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        setApiError(null);

        try {
            await api.post("/customers/", {
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim()
            });
            onSuccess("Customer added successfully");
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
                    <Modal.Title className="fs-5">Add Customer</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {apiError && <Alert variant="danger" className="py-2">{apiError}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            value={form.full_name}
                            onChange={handleChange("full_name")}
                            isInvalid={Boolean(errors.full_name)}
                            placeholder="e.g. Rohan Sharma"
                            disabled={submitting}
                        />
                        <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={form.email}
                            onChange={handleChange("email")}
                            isInvalid={Boolean(errors.email)}
                            placeholder="e.g. rohan@example.com"
                            disabled={submitting}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            value={form.phone}
                            onChange={handleChange("phone")}
                            isInvalid={Boolean(errors.phone)}
                            placeholder="e.g. 9876543210"
                            disabled={submitting}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                        Add Customer
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CustomerFormModal;