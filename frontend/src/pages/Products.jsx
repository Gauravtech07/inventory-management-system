import { useCallback, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

import api from "../services/api";
import { useNotification } from "../context/Notificationcontext";

import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/Loadingspinner";
import EmptyState from "../components/Emptystate";
import Pagination from "../components/pagination";
import ConfirmDialog from "../components/Confirmdialog";
import ProductFormModal from "../components/ProductFormmodal";
import ProductDetailsModal from "../components/ProductDetailsmodal";

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function Products() {
    const { notifySuccess, notifyError } = useNotification();

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
    const [lowStockOnly, setLowStockOnly] = useState(false);

    const [formModal, setFormModal] = useState({ show: false, product: null });
    const [viewTarget, setViewTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // debounce search input -> search (avoids an API call per keystroke)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get("/products/", {
                params: {
                    page,
                    page_size: pageSize,
                    ...(search ? { search } : {}),
                    ...(statusFilter !== "all" ? { is_active: statusFilter === "active" } : {}),
                    ...(lowStockOnly ? { low_stock: true } : {})
                }
            });

            setProducts(response.data.data || []);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.normalizedMessage || "Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, statusFilter, lowStockOnly]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleFormSuccess = (message) => {
        setFormModal({ show: false, product: null });
        notifySuccess(message);
        loadProducts();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            notifySuccess("Product deleted successfully");
            setDeleteTarget(null);

            // if we deleted the last item on this page, step back a page
            if (products.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                loadProducts();
            }
        } catch (err) {
            notifyError(err.normalizedMessage || "Failed to delete product");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <MainLayout>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
                <h2 className="fw-bold mb-0">Products</h2>
                <Button variant="primary" onClick={() => setFormModal({ show: true, product: null })}>
                    <i className="bi bi-plus-lg me-1"></i> Add Product
                </Button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    {/* Filters */}
                    <div className="row g-2 mb-3">
                        <div className="col-md-5">
                            <Form.Control
                                placeholder="Search by name or SKU..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="col-6 col-md-3">
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </div>
                        <div className="col-6 col-md-4 d-flex align-items-center">
                            <Form.Check
                                type="checkbox"
                                id="lowStockOnly"
                                label="Low stock only"
                                checked={lowStockOnly}
                                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
                            />
                        </div>
                    </div>

                    {loading && <LoadingSpinner label="Loading products..." fullHeight />}

                    {!loading && error && (
                        <EmptyState
                            icon="bi-exclamation-triangle"
                            title="Couldn't load products"
                            message={error}
                            actionLabel="Retry"
                            onAction={loadProducts}
                        />
                    )}

                    {!loading && !error && products.length === 0 && (
                        <EmptyState
                            icon="bi-box"
                            title={search || lowStockOnly || statusFilter !== "all" ? "No matching products" : "No products yet"}
                            message={search || lowStockOnly || statusFilter !== "all"
                                ? "Try adjusting your search or filters."
                                : "Add your first product to start tracking inventory."}
                            actionLabel="Add Product"
                            onAction={() => setFormModal({ show: true, product: null })}
                        />
                    )}

                    {!loading && !error && products.length > 0 && (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <table className="table ims-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>SKU</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => {
                                            const isLowStock = p.quantity <= p.minimum_stock;
                                            return (
                                                <tr key={p.id}>
                                                    <td className="fw-semibold">{p.name}</td>
                                                    <td className="text-muted">{p.sku}</td>
                                                    <td>{formatCurrency(p.price)}</td>
                                                    <td>
                                                        {p.quantity}
                                                        {isLowStock && (
                                                            <span className="badge bg-danger-subtle text-danger ms-2">
                                                                Low
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${p.is_active ? "bg-success" : "bg-secondary"}`}>
                                                            {p.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            className="me-2"
                                                            onClick={() => setViewTarget(p)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            className="me-2"
                                                            onClick={() => setFormModal({ show: true, product: p })}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            className="text-danger"
                                                            onClick={() => setDeleteTarget(p)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list — replaces the table below md breakpoint */}
                            <div className="d-md-none d-flex flex-column gap-2">
                                {products.map((p) => {
                                    const isLowStock = p.quantity <= p.minimum_stock;
                                    return (
                                        <div key={p.id} className="border rounded-3 p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <div className="fw-semibold">{p.name}</div>
                                                    <div className="text-muted small">{p.sku}</div>
                                                </div>
                                                <span className={`badge ${p.is_active ? "bg-success" : "bg-secondary"}`}>
                                                    {p.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between small mb-2">
                                                <span className="text-muted">Price: <strong className="text-dark">{formatCurrency(p.price)}</strong></span>
                                                <span className="text-muted">
                                                    Qty: <strong className="text-dark">{p.quantity}</strong>
                                                    {isLowStock && (
                                                        <span className="badge bg-danger-subtle text-danger ms-1">Low</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="d-flex gap-2 pt-2 border-top">
                                                <Button size="sm" variant="light" className="flex-grow-1" onClick={() => setViewTarget(p)}>
                                                    <i className="bi bi-eye me-1"></i> View
                                                </Button>
                                                <Button size="sm" variant="light" className="flex-grow-1" onClick={() => setFormModal({ show: true, product: p })}>
                                                    <i className="bi bi-pencil me-1"></i> Edit
                                                </Button>
                                                <Button size="sm" variant="light" className="text-danger" onClick={() => setDeleteTarget(p)}>
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                pagination={pagination}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                            />
                        </>
                    )}

                </div>
            </div>

            <ProductFormModal
                show={formModal.show}
                product={formModal.product}
                onClose={() => setFormModal({ show: false, product: null })}
                onSuccess={handleFormSuccess}
            />

            <ProductDetailsModal
                show={Boolean(viewTarget)}
                product={viewTarget}
                onClose={() => setViewTarget(null)}
            />

            <ConfirmDialog
                show={Boolean(deleteTarget)}
                title="Delete product"
                message={deleteTarget ? `Delete "${deleteTarget.name}"? This will deactivate the product.` : ""}
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

        </MainLayout>
    );
}

export default Products;