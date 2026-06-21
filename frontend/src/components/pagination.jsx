import { Form } from "react-bootstrap";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * <Pagination
 *   pagination={{ total, page, page_size, total_pages }}
 *   onPageChange={(page) => setPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 */
function Pagination({ pagination, onPageChange, onPageSizeChange }) {
    if (!pagination) return null;

    const { total, page, page_size, total_pages } = pagination;

    if (total === 0) return null;

    const start = (page - 1) * page_size + 1;
    const end = Math.min(page * page_size, total);

    const goTo = (p) => {
        if (p < 1 || p > total_pages || p === page) return;
        onPageChange(p);
    };

    // Show a compact set of page numbers around the current page
    const pageNumbers = [];
    const windowSize = 1;
    for (let p = 1; p <= total_pages; p++) {
        if (
            p === 1 ||
            p === total_pages ||
            (p >= page - windowSize && p <= page + windowSize)
        ) {
            pageNumbers.push(p);
        } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
            pageNumbers.push("...");
        }
    }

    return (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
            <div className="d-flex align-items-center gap-2 text-muted small">
                <span>
                    Showing {start}–{end} of {total}
                </span>

                {onPageSizeChange && (
                    <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={page_size}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size} / page
                            </option>
                        ))}
                    </Form.Select>
                )}
            </div>

            {total_pages > 1 && (
                <nav>
                    <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => goTo(page - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {pageNumbers.map((p, idx) =>
                            p === "..." ? (
                                <li key={`ellipsis-${idx}`} className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            ) : (
                                <li
                                    key={p}
                                    className={`page-item ${p === page ? "active" : ""}`}
                                >
                                    <button className="page-link" onClick={() => goTo(p)}>
                                        {p}
                                    </button>
                                </li>
                            )
                        )}

                        <li className={`page-item ${page === total_pages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => goTo(page + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default Pagination;