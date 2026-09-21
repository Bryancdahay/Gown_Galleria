import { useEffect, useState } from "react";
import {
    getAuditTrail,
    getCategories,
    getCurrentShop,
    getProducts,
    getShops,
    getUsers,
} from "../data/catalog";

function DashboardPage() {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const currentShop = getCurrentShop();
    const isShopAdmin = currentUser?.role === "shop-admin";
    const isSuperAdmin = currentUser?.role === "super-admin";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [auditTrail, setAuditTrail] = useState([]);
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);

    const loadData = () => {
        const allProducts = getProducts();
        const shopProducts = currentShop
            ? allProducts.filter((product) => product.shopId === currentShop.id)
            : isShopAdmin
                ? []
                : allProducts;
        setProducts(shopProducts);

        const shopCategories = currentShop
            ? getCategories().filter((category) => category.shopId === currentShop.id)
            : isShopAdmin
                ? []
                : getCategories();
        setCategories(shopCategories);

        const shopAudit = currentShop
            ? getAuditTrail("shop-admin", currentShop.id)
            : isShopAdmin
                ? []
                : getAuditTrail(isSuperAdmin ? "super-admin" : undefined);
        setAuditTrail(shopAudit);

        setUsers(getUsers());
        setShops(getShops());
    };

    useEffect(() => {
        loadData();

        const handleAuditUpdate = () => {
            loadData();
        };

        window.addEventListener("audit:updated", handleAuditUpdate);
        window.addEventListener("storage", handleAuditUpdate);

        return () => {
            window.removeEventListener("audit:updated", handleAuditUpdate);
            window.removeEventListener("storage", handleAuditUpdate);
        };
    }, []);

    const totalRevenue = products.reduce((sum, product) => sum + product.price, 0);
    const roleLabel = isSuperAdmin ? "Super admin" : "Shop admin";

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        {roleLabel}
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        {currentShop?.name || "Dashboard"}
                    </h1>
                </div>
            </div>

            <div className={`grid gap-6 ${isSuperAdmin ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
                {isSuperAdmin ? (
                    <>
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <p className="text-sm font-medium text-gray-500">Users</p>
                            <p className="mt-3 text-3xl font-bold text-gray-900">
                                {users.length}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <p className="text-sm font-medium text-gray-500">Shops</p>
                            <p className="mt-3 text-3xl font-bold text-gray-900">
                                {shops.length}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <p className="text-sm font-medium text-gray-500">Products</p>
                            <p className="mt-3 text-3xl font-bold text-gray-900">
                                {products.length}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <p className="text-sm font-medium text-gray-500">Categories</p>
                            <p className="mt-3 text-3xl font-bold text-gray-900">
                                {categories.length}
                            </p>
                        </div>
                    </>
                )}

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-500">Audit trail</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {auditTrail.length}
                    </p>
                </div>

                {!isSuperAdmin && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <p className="text-sm font-medium text-gray-500">Products value</p>
                        <p className="mt-3 text-3xl font-bold text-pink-600">
                            ₱{totalRevenue.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-10">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Recent activity
                    </h2>

                    <div className="mt-5 space-y-3">
                        {auditTrail.length === 0 ? (
                            <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                                No audit entries yet.
                            </div>
                        ) : (
                            auditTrail.slice(0, 5).map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {entry.action}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {entry.details}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DashboardPage;
