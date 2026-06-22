import { useCallback, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

import api from "../services/api";
import { useNotification } from "../context/Notificationcontext";

import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/Loadingspinner";
import EmptyState from "../components/Emptystate";
import Pagination from "../components/pagination";
import ConfirmDialog from "../components/Confirmdialog";
import StatusBadge from "../components/Statusbadge";
import OrderFormModal from "../components/OrderFormmodal";
import OrderDetailsModal from "../components/Orderdetailsmodal";

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}
 
function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
 
function Orders() {
    const { notifySuccess, notifyError } = useNotification();
 
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all");
 
    const [customers, setCustomers] = useState([]);
    const [customerFilter, setCustomerFilter] = useState("all");
 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewOrderId, setViewOrderId] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);
 
    // Customer list for the filter dropdown (loaded once)
    useEffect(() => {
        api.get("/customers/", { params: { page: 1, page_size: 100 } })
            .then((res) => setCustomers(res.data.data || []))
            .catch(() => { /* filter dropdown is non-critical; fail silently */ });
    }, []);
 
    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
 
        try {
            const response = await api.get("/orders/", {
                params: {
                    page,
                    page_size: pageSize,
                    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
                    ...(customerFilter !== "all" ? { customer_id: customerFilter } : {})
                }
            });
 
            setOrders(response.data.data || []);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.normalizedMessage || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, statusFilter, customerFilter]);
 
    useEffect(() => {
        loadOrders();
    }, [loadOrders]);
 
    const handleCreateSuccess = (message) => {
        setShowCreateModal(false);
        notifySuccess(message);
        setPage(1);
        loadOrders();
    };
 
    const handleCancel = async () => {
        if (!cancelTarget) return;
 
        setCancelling(true);
        try {
            await api.delete(`/orders/${cancelTarget.id}`);
            notifySuccess("Order cancelled and inventory restored");
            setCancelTarget(null);
            loadOrders();
        } catch (err) {
            notifyError(err.normalizedMessage || "Failed to cancel order");
        } finally {
            setCancelling(false);
        }
    };
 
    return (
        <MainLayout>
 
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
                <h2 className="fw-bold mb-0">Orders</h2>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-lg me-1"></i> Create Order
                </Button>
            </div>
 
            <div className="card border-0 shadow-sm">
                <div className="card-body">
 
                    <div className="row g-2 mb-3">
                        <div className="col-6 col-md-3">
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </div>
                        <div className="col-6 col-md-4">
                            <Form.Select
                                value={customerFilter}
                                onChange={(e) => { setCustomerFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">All Customers</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
 
                    {loading && <LoadingSpinner label="Loading orders..." fullHeight />}
 
                    {!loading && error && (
                        <EmptyState
                            icon="bi-exclamation-triangle"
                            title="Couldn't load orders"
                            message={error}
                            actionLabel="Retry"
                            onAction={loadOrders}
                        />
                    )}
 
                    {!loading && !error && orders.length === 0 && (
                        <EmptyState
                            icon="bi-cart-check"
                            title={statusFilter !== "all" || customerFilter !== "all" ? "No matching orders" : "No orders yet"}
                            message={statusFilter !== "all" || customerFilter !== "all"
                                ? "Try a different filter."
                                : "Create your first order to get started."}
                            actionLabel="Create Order"
                            onAction={() => setShowCreateModal(true)}
                        />
                    )}
 
                    {!loading && !error && orders.length > 0 && (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <table className="table ims-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((o) => (
                                            <tr key={o.id}>
                                                <td className="fw-semibold">#{o.id}</td>
                                              <td>{o.customer_name}</td>
                                                <td>{o.mobile}</td>
                                                <td>{o.email}</td>
                                                <td>{formatCurrency(o.total_amount)}</td>
                                                <td><StatusBadge status={o.status} /></td>
                                                <td className="text-muted small">{formatDate(o.created_at)}</td>
                                                <td className="text-end">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        className="me-2"
                                                        onClick={() => setViewOrderId(o.id)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        className="text-danger"
                                                        onClick={() => setCancelTarget(o)}
                                                        disabled={o.status === "cancelled"}
                                                        title={o.status === "cancelled" ? "Already cancelled" : "Cancel order"}
                                                    >
                                                        <i className="bi bi-x-circle"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
 
                            {/* Mobile card list — replaces the table below md breakpoint */}
                            <div className="d-md-none d-flex flex-column gap-2">
                                {orders.map((o) => (
                                    <div key={o.id} className="border rounded-3 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="fw-semibold">Order #{o.id}</div>
                                            <StatusBadge status={o.status} />
                                        </div>
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted">Customer ID: <strong className="text-dark">{o.customer_id}</strong></span>
                                            <span className="text-muted">{formatDate(o.created_at)}</span>
                                        </div>
                                        <div className="small mb-2">
                                            <span className="text-muted">Amount: </span>
                                            <strong className="text-dark">{formatCurrency(o.total_amount)}</strong>
                                        </div>
                                        <div className="d-flex gap-2 pt-2 border-top">
                                            <Button size="sm" variant="light" className="flex-grow-1" onClick={() => setViewOrderId(o.id)}>
                                                <i className="bi bi-eye me-1"></i> View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                className="text-danger"
                                                onClick={() => setCancelTarget(o)}
                                                disabled={o.status === "cancelled"}
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Cancel
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
 
            <OrderFormModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
 
            <OrderDetailsModal
                show={Boolean(viewOrderId)}
                orderId={viewOrderId}
                onClose={() => setViewOrderId(null)}
            />
 
            <ConfirmDialog
                show={Boolean(cancelTarget)}
                title="Cancel order"
                message={cancelTarget ? `Cancel order #${cancelTarget.id}? This will restore the ordered items back to stock.` : ""}
                confirmLabel="Cancel Order"
                confirmVariant="danger"
                loading={cancelling}
                onConfirm={handleCancel}
                onCancel={() => setCancelTarget(null)}
            />
 
        </MainLayout>
    );
}
 
export default Orders;
