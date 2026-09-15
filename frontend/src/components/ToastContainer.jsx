import { useEffect, useState } from "react";

function ToastContainer() {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        function handleToast(event) {
            const { message, type = "success" } = event.detail || {};

            if (!message) {
                return;
            }

            setToast({ message, type });

            window.setTimeout(() => {
                setToast(null);
            }, 2400);
        }

        window.addEventListener("toast:show", handleToast);

        return () => {
            window.removeEventListener("toast:show", handleToast);
        };
    }, []);

    if (!toast) {
        return null;
    }

    const palette = {
        success: "border-green-200 bg-green-50 text-green-800",
        error: "border-red-200 bg-red-50 text-red-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
    };

    return (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[9999] flex justify-center px-4">
            <div
                className={`max-w-md rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${palette[toast.type] || palette.success}`}
                role="status"
                aria-live="polite"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">✓</span>
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            </div>
        </div>
    );
}

export default ToastContainer;
