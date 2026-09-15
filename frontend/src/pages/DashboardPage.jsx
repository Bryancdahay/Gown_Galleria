import { getAuditTrail, getProducts, getUsers } from "../data/catalog";

function DashboardPage() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const products = getProducts();
    const users = getUsers();
    const auditTrail = getAuditTrail();
    const isSuperAdmin = currentUser?.role === "super-admin";

    const totalRevenue = products.reduce((sum, product) => sum + product.price, 0);
    const roleLabel = isSuperAdmin ? "Super admin" : "Shop admin";

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                    {roleLabel}
                </p>
                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                    Dashboard
                </h1>
            </div>

            <div className={`grid gap-6 ${isSuperAdmin ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-500">Products</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {products.length}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-500">Users</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {users.length}
                    </p>
                </div>

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

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Recent activity
                    </h2>

                    <div className="mt-5 space-y-3">
                        {auditTrail.slice(0, 5).map((entry) => (
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
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Quick links
                    </h2>

                    <div className="mt-5 space-y-3">
                        {currentUser?.role === "shop-admin" && (
                            <a
                                href="/admin/inventory"
                                className="block rounded-2xl bg-pink-50 px-4 py-3 font-semibold text-pink-700"
                            >
                                Inventory management
                            </a>
                        )}
                        {currentUser?.role === "super-admin" && (
                            <a
                                href="/admin/shop-management"
                                className="block rounded-2xl bg-pink-50 px-4 py-3 font-semibold text-pink-700"
                            >
                                Shop management
                            </a>
                        )}
                        <a
                            href="/admin/audit-trail"
                            className="block rounded-2xl bg-gray-50 px-4 py-3 font-semibold text-gray-700"
                        >
                            Audit trail
                        </a>
                        <a
                            href="/admin/audit-report"
                            className="block rounded-2xl bg-gray-50 px-4 py-3 font-semibold text-gray-700"
                        >
                            Audit report
                        </a>
                        {(currentUser?.role === "shop-admin" || currentUser?.role === "super-admin") && (
                            <a
                                href="/admin/user-management"
                                className="block rounded-2xl bg-gray-50 px-4 py-3 font-semibold text-gray-700"
                            >
                                User management
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DashboardPage;
