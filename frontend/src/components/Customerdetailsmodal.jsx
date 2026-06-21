import { Modal, Button } from "react-bootstrap";

function CustomerDetailsModal({ show, customer, onClose }) {
    if (!customer) return null;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">Customer Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <dl className="row mb-0">
                    <dt className="col-5 text-muted fw-normal">Full Name</dt>
                    <dd className="col-7">{customer.full_name}</dd>

                    <dt className="col-5 text-muted fw-normal">Email</dt>
                    <dd className="col-7">{customer.email}</dd>

                    <dt className="col-5 text-muted fw-normal">Phone</dt>
                    <dd className="col-7">{customer.phone}</dd>

                    <dt className="col-5 text-muted fw-normal">Status</dt>
                    <dd className="col-7">
                        <span className={`badge ${customer.is_active ? "bg-success" : "bg-secondary"}`}>
                            {customer.is_active ? "Active" : "Inactive"}
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

export default CustomerDetailsModal;