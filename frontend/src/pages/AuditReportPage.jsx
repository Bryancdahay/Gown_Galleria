import { useEffect, useState } from "react";
import {
    getAuditTrail,
    getCurrentShop,
    getProducts,
    getUsers,
} from "../data/catalog";

function AuditReportPage() {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const currentShop = getCurrentShop();

    const [auditTrail, setAuditTrail] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    const fetchReportData = () => {
        const trail = currentShop
            ? getAuditTrail("shop-admin", currentShop.id)
            : currentUser?.role === "shop-admin"
                ? []
                : getAuditTrail(currentUser?.role);
        setAuditTrail(trail);

        setUsers(getUsers());

        const prods = currentShop
            ? getProducts().filter((product) => product.shopId === currentShop.id)
            : currentUser?.role === "shop-admin"
                ? []
                : getProducts();
        setProducts(prods);
    };

    useEffect(() => {
        fetchReportData();

        const handleUpdate = () => fetchReportData();
        window.addEventListener("audit:updated", handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener("audit:updated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    const grouped = auditTrail.reduce((acc, entry) => {
        acc[entry.action] = (acc[entry.action] || 0) + 1;
        return acc;
    }, {});

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                    {currentUser?.role === "super-admin" ? "Super admin" : "Shop admin"}
                </p>
                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                    Report
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">
                        {currentShop ? "Shop products" : "Total users"}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {currentShop ? products.length : users.length}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">Audit entries</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {auditTrail.length}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">Actions logged</p>
                    <p className="mt-3 text-3xl font-bold text-pink-600">
                        {Object.keys(grouped).length}
                    </p>
                </div>
            </div>

            <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Summary by action</h2>

                <div className="mt-6 space-y-4">
                    {Object.entries(grouped).map(([action, count]) => (
                        <div key={action} className="rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">
                                    {action}
                                </span>
                                <span className="text-sm text-gray-500">{count} events</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default AuditReportPage;
