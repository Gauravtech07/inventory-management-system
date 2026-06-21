import { Button } from "react-bootstrap";

/**
 * <EmptyState
 *   icon="bi-box"
 *   title="No products yet"
 *   message="Add your first product to start tracking inventory."
 *   actionLabel="Add Product"
 *   onAction={() => setShowAddModal(true)}
 * />
 */
function EmptyState({ icon = "bi-inbox", title, message, actionLabel, onAction }) {
    return (
        <div className="ims-empty-state">
            <i className={`bi ${icon}`} style={{ fontSize: "2.5rem" }}></i>
            <h5 className="mt-3 mb-1 text-dark">{title}</h5>
            {message && <p className="mb-3">{message}</p>}
            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;