import { useCallback, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

import api from "../services/api";
import { useNotification } from "../context/Notificationcontext";

import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/Loadingspinner";
import EmptyState from "../components/Emptystate";
import Pagination from "../components/pagination";
import ConfirmDialog from "../components/Confirmdialog";
import CustomerFormModal from "../components/CustomerFormModal";
import CustomerDetailsModal from "../components/Customerdetailsmodal";

function Customers() {
    const { notifySuccess, notifyError } = useNotification();

    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [viewTarget, setViewTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get("/customers/", {
                params: {
                    page,
                    page_size: pageSize,
                    ...(search ? { search } : {})
                }
            });

            setCustomers(response.data.data || []);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.normalizedMessage || "Failed to load customers");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const handleAddSuccess = (message) => {
        setShowAddModal(false);
        notifySuccess(message);
        loadCustomers();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await api.delete(`/customers/${deleteTarget.id}`);
            notifySuccess("Customer deleted successfully");
            setDeleteTarget(null);

            if (customers.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                loadCustomers();
            }
        } catch (err) {
            notifyError(err.normalizedMessage || "Failed to delete customer");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <MainLayout>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
                <h2 className="fw-bold mb-0">Customers</h2>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <i className="bi bi-plus-lg me-1"></i> Add Customer
                </Button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body">

                    <div className="mb-3" style={{ maxWidth: "360px" }}>
                        <Form.Control
                            placeholder="Search by name, email, or phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    {loading && <LoadingSpinner label="Loading customers..." fullHeight />}

                    {!loading && error && (
                        <EmptyState
                            icon="bi-exclamation-triangle"
                            title="Couldn't load customers"
                            message={error}
                            actionLabel="Retry"
                            onAction={loadCustomers}
                        />
                    )}

                    {!loading && !error && customers.length === 0 && (
                        <EmptyState
                            icon="bi-people"
                            title={search ? "No matching customers" : "No customers yet"}
                            message={search ? "Try a different search term." : "Add your first customer to get started."}
                            actionLabel="Add Customer"
                            onAction={() => setShowAddModal(true)}
                        />
                    )}

                    {!loading && !error && customers.length > 0 && (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <table className="table ims-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((c) => (
                                            <tr key={c.id}>
                                                <td className="fw-semibold">{c.full_name}</td>
                                                <td className="text-muted">{c.email}</td>
                                                <td className="text-muted">{c.phone}</td>
                                                <td>
                                                    <span className={`badge ${c.is_active ? "bg-success" : "bg-secondary"}`}>
                                                        {c.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        className="me-2"
                                                        onClick={() => setViewTarget(c)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        className="text-danger"
                                                        onClick={() => setDeleteTarget(c)}
                                                        disabled={!c.is_active}
                                                        title={!c.is_active ? "Already inactive" : "Delete customer"}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list — replaces the table below md breakpoint */}
                            <div className="d-md-none d-flex flex-column gap-2">
                                {customers.map((c) => (
                                    <div key={c.id} className="border rounded-3 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="fw-semibold">{c.full_name}</div>
                                            <span className={`badge ${c.is_active ? "bg-success" : "bg-secondary"}`}>
                                                {c.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="small text-muted mb-1">
                                            <i className="bi bi-envelope me-1"></i>{c.email}
                                        </div>
                                        <div className="small text-muted mb-2">
                                            <i className="bi bi-telephone me-1"></i>{c.phone}
                                        </div>
                                        <div className="d-flex gap-2 pt-2 border-top">
                                            <Button size="sm" variant="light" className="flex-grow-1" onClick={() => setViewTarget(c)}>
                                                <i className="bi bi-eye me-1"></i> View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                className="text-danger"
                                                onClick={() => setDeleteTarget(c)}
                                                disabled={!c.is_active}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
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

            <CustomerFormModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />

            <CustomerDetailsModal
                show={Boolean(viewTarget)}
                customer={viewTarget}
                onClose={() => setViewTarget(null)}
            />

            <ConfirmDialog
                show={Boolean(deleteTarget)}
                title="Delete customer"
                message={deleteTarget ? `Delete "${deleteTarget.full_name}"? This will deactivate the customer.` : ""}
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

        </MainLayout>
    );
}

export default Customers;