import { createContext, useCallback, useContext, useState } from "react";
import { ToastContainer, Toast } from "react-bootstrap";

const NotificationContext = createContext(null);

let idCounter = 0;

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((message, variant = "success") => {
        const id = ++idCounter;
        setToasts((current) => [...current, { id, message, variant }]);

        // auto-dismiss after 4s
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const notifySuccess = useCallback((message) => notify(message, "success"), [notify]);
    const notifyError = useCallback((message) => notify(message, "danger"), [notify]);

    return (
        <NotificationContext.Provider value={{ notifySuccess, notifyError }}>
            {children}

            <ToastContainer
                position="top-end"
                className="p-3"
                style={{ zIndex: 1100, position: "fixed" }}
            >
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        bg={t.variant}
                        onClose={() => removeToast(t.id)}
                        autohide
                        delay={4000}
                    >
                        <Toast.Header closeButton>
                            <strong className="me-auto">
                                {t.variant === "success" ? "Success" : "Error"}
                            </strong>
                        </Toast.Header>
                        <Toast.Body className={t.variant === "danger" ? "text-white" : ""}>
                            {t.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </NotificationContext.Provider>
    );
}

// Usage in any page: const { notifySuccess, notifyError } = useNotification();
export function useNotification() {
    const ctx = useContext(NotificationContext);

    if (!ctx) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }

    return ctx;
}