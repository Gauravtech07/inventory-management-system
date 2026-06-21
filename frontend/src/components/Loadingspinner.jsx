import { Spinner } from "react-bootstrap";

/**
 * size: "sm" for inline use, default for page/section loading
 * fullHeight: centers vertically in a tall container (use for page loads)
 */
function LoadingSpinner({ label = "Loading...", size, fullHeight = false }) {
    return (
        <div
            className={`d-flex flex-column align-items-center justify-content-center text-muted ${
                fullHeight ? "py-5" : "py-4"
            }`}
            style={fullHeight ? { minHeight: "300px" } : undefined}
        >
            <Spinner animation="border" role="status" size={size} className="mb-2" />
            <span className="small">{label}</span>
        </div>
    );
}

export default LoadingSpinner;