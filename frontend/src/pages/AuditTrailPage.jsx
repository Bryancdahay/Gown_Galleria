import { getAuditTrail, getCurrentShop } from "../data/catalog";

function AuditTrailPage() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentShop = getCurrentShop();
    const auditTrail = currentShop
        ? getAuditTrail("shop-admin", currentShop.id)
        : currentUser?.role === "shop-admin"
            ? []
            : getAuditTrail(currentUser?.role);

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                    {currentUser?.role === "super-admin" ? "Super admin" : "Shop admin"}
                </p>
                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                    Audit trail
                </h1>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="space-y-4">
                    {auditTrail.length ? (
                        auditTrail.map((entry) => (
                            <div
                                key={entry.id}
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <p className="font-semibold text-gray-900">
                                        {entry.action}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {entry.details}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                            No audit entries yet.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default AuditTrailPage;
