import { Badge } from "react-bootstrap";

const STATUS_CONFIG = {
    pending: { bg: "warning", label: "Pending" },
    completed: { bg: "success", label: "Completed" },
    cancelled: { bg: "secondary", label: "Cancelled" }
};

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || { bg: "light", label: status };

    return (
        <Badge bg={config.bg} className="text-capitalize fw-normal px-2 py-1">
            {config.label}
        </Badge>
    );
}

export default StatusBadge;