import { BrowserRouter, Routes, Route } from "react-router-dom";

import { NotificationProvider } from "./context/Notificationcontext";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";

function App() {
    return (
        <NotificationProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
}

export default App;