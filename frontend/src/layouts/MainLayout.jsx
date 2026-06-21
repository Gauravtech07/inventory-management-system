import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Navbar setSidebarOpen={setSidebarOpen} />

            <div className="d-flex">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main
                    className="flex-grow-1 p-3 p-md-4 bg-light"
                    style={{
                        minHeight: "calc(100vh - 56px)",
                        minWidth: 0 // prevents flex children from causing horizontal overflow
                    }}
                >
                    {children}
                </main>
            </div>
        </>
    );
}

export default MainLayout;