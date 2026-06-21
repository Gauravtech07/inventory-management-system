import { useCallback, useEffect, useState } from "react";

import api from "../services/api";
import { useNotification } from "../context/Notificationcontext";

import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import LoadingSpinner from "../components/Loadingspinner";
import EmptyState from "../components/Emptystate";
import StatusBadge from "../components/Statusbadge";

const RECENT_ORDERS_LIMIT = 5;

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatCurrency(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function Dashboard() {

    const { notifyError } = useNotification();

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        setStatsError(null);

        try {
            const response = await api.get("/dashboard");
            setStats(response.data.data);
        } catch (error) {
            setStatsError(error.normalizedMessage || "Failed to load dashboard stats");
            notifyError(error.normalizedMessage || "Failed to load dashboard stats");
        } finally {
            setStatsLoading(false);
        }
    }, [notifyError]);

    const loadRecentOrders = useCallback(async () => {
        setOrdersLoading(true);
        setOrdersError(null);

        try {
            const response = await api.get("/orders", {
                params: { page: 1, page_size: RECENT_ORDERS_LIMIT }
            });
            setRecentOrders(response.data.data || []);
        } catch (error) {
            setOrdersError(error.normalizedMessage || "Failed to load recent orders");
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        loadRecentOrders();
    }, [loadStats, loadRecentOrders]);

    return (
        <MainLayout>

            <h2 className="mb-4 fw-bold">
                Dashboard
            </h2>

            {/* ---- Stat cards ---- */}
            {statsLoading && <LoadingSpinner label="Loading dashboard..." fullHeight />}

            {!statsLoading && statsError && (
                <div className="card border-0 shadow-sm mb-4">
                    <EmptyState
                        icon="bi-exclamation-triangle"
                        title="Couldn't load dashboard"
                        message={statsError}
                        actionLabel="Retry"
                        onAction={loadStats}
                    />
                </div>
            )}

            {!statsLoading && !statsError && stats && (
                <div className="row">

                    <DashboardCard
                        title="Total Products"
                        value={stats.total_products}
                        icon="bi-box"
                        color="primary"
                    />

                    <DashboardCard
                        title="Total Customers"
                        value={stats.total_customers}
                        icon="bi-people"
                        color="success"
                    />

                    <DashboardCard
                        title="Total Orders"
                        value={stats.total_orders}
                        icon="bi-cart-check"
                        color="info"
                    />

                    <DashboardCard
                        title="Low Stock"
                        value={stats.low_stock_products}
                        icon="bi-exclamation-triangle"
                        color="danger"
                    />

                    <DashboardCard
                        title="Pending Orders"
                        value={stats.pending_orders}
                        icon="bi-hourglass-split"
                        color="warning"
                    />

                    <DashboardCard
                        title="Cancelled Orders"
                        value={stats.cancelled_orders}
                        icon="bi-x-circle"
                        color="secondary"
                    />

                </div>
            )}

            {/* ---- Recent Orders ---- */}
            <div className="card border-0 shadow-sm mt-2">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Recent Orders</h5>
                        <a href="/orders" className="small text-decoration-none">
                            View all <i className="bi bi-arrow-right"></i>
                        </a>
                    </div>

                    {ordersLoading && <LoadingSpinner label="Loading recent orders..." />}

                    {!ordersLoading && ordersError && (
                        <EmptyState
                            icon="bi-exclamation-triangle"
                            title="Couldn't load recent orders"
                            message={ordersError}
                            actionLabel="Retry"
                            onAction={loadRecentOrders}
                        />
                    )}

                    {!ordersLoading && !ordersError && recentOrders.length === 0 && (
                        <EmptyState
                            icon="bi-cart-check"
                            title="No orders yet"
                            message="Orders you create will show up here."
                            actionLabel="Create Order"
                            onAction={() => (window.location.href = "/orders")}
                        />
                    )}

                    {!ordersLoading && !ordersError && recentOrders.length > 0 && (
                        <>
                            <div className="table-responsive d-none d-md-block">
                                <table className="table ims-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer ID</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="fw-semibold">#{order.id}</td>
                                                <td>{order.customer_id}</td>
                                                <td>{formatCurrency(order.total_amount)}</td>
                                                <td><StatusBadge status={order.status} /></td>
                                                <td className="text-muted small">{formatDate(order.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-md-none d-flex flex-column gap-2">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="border rounded-3 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="fw-semibold">Order #{order.id}</div>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span className="text-muted">Customer ID: <strong className="text-dark">{order.customer_id}</strong></span>
                                            <span className="text-muted">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="small mt-1">
                                            <span className="text-muted">Amount: </span>
                                            <strong className="text-dark">{formatCurrency(order.total_amount)}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </div>

            </div>

        </MainLayout>
    );
}

export default Dashboard;