import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

function Navbar({ setSidebarOpen }) {

    return (
        <nav className="ims-navbar navbar navbar-dark px-3 px-md-4 flex-nowrap">

            <div className="d-flex align-items-center gap-2 flex-shrink-1" style={{ minWidth: 0 }}>

                <button
                    className="btn btn-sm ims-navbar-toggle d-lg-none flex-shrink-0"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <i className="bi bi-list fs-4"></i>
                </button>

                <Link
                    to="/"
                    className="d-flex align-items-center gap-2 text-decoration-none"
                    style={{ minWidth: 0 }}
                >
                    <span className="ims-navbar-logo flex-shrink-0">
                        <i className="bi bi-boxes"></i>
                    </span>

                    <span className="navbar-brand mb-0 text-truncate">
                        <span className="d-none d-sm-inline">Inventory Management System</span>
                        <span className="d-inline d-sm-none">IMS</span>
                    </span>
                </Link>

            </div>

            <i className="bi bi-person-circle text-white fs-4 flex-shrink-0"></i>

        </nav>
    );
}

export default Navbar;