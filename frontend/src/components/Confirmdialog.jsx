import { Modal, Button, Spinner } from "react-bootstrap";

/**
 * Reusable confirmation dialog.
 *
 * <ConfirmDialog
 *   show={showConfirm}
 *   title="Delete product"
 *   message={`Delete "${product.name}"? This cannot be undone.`}
 *   confirmLabel="Delete"
 *   confirmVariant="danger"
 *   loading={deleting}
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
function ConfirmDialog({
    show,
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "danger",
    loading = false,
    onConfirm,
    onCancel
}) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className="mb-0 text-secondary">{message}</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="light" onClick={onCancel} disabled={loading}>
                    {cancelLabel}
                </Button>

                <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
                    {loading && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                        />
                    )}
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDialog;