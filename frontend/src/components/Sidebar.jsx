import { Link, useLocation } from "react-router-dom";

function Sidebar({
    sidebarOpen,
    setSidebarOpen
}) {

    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/",
            icon: "bi-speedometer2"
        },
        {
            name: "Products",
            path: "/products",
            icon: "bi-box"
        },
        {
            name: "Customers",
            path: "/customers",
            icon: "bi-people"
        },
        {
            name: "Orders",
            path: "/orders",
            icon: "bi-cart-check"
        }
    ];

    return (
        <>
            {sidebarOpen && (
                <div
                    className="position-fixed start-0 w-100 bg-dark d-lg-none"
                    style={{
                        top: "60px",
                        height: "calc(100vh - 60px)",
                        opacity: 0.4,
                        zIndex: 1040
                    }}
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <div
                className={`ims-sidebar bg-white border-end
                ${sidebarOpen ? "ims-sidebar-open" : ""}`}
            >

                <div className="p-3 d-flex flex-column h-100">

                    <div className="d-flex justify-content-between align-items-center mb-1">

                        <h6 className="text-uppercase text-muted fw-bold mb-0" style={{ letterSpacing: "0.05em", fontSize: "0.75rem" }}>
                            Menu
                        </h6>

                        <button
                            className="btn btn-sm btn-light d-lg-none"
                            onClick={() =>
                                setSidebarOpen(false)
                            }
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                    </div>

                    <hr className="mt-2" />

                    <nav className="d-flex flex-column gap-1">
                        {menuItems.map((item) => (

                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                                className={`ims-nav-link d-flex align-items-center p-2 rounded text-decoration-none
                                ${
                                    location.pathname === item.path
                                        ? "active bg-primary text-white"
                                        : "text-dark"
                                }`}
                            >
                                <i
                                    className={`bi ${item.icon} me-2`}
                                ></i>

                                {item.name}

                            </Link>

                        ))}
                    </nav>

                </div>

            </div>
        </>
    );
}

export default Sidebar;