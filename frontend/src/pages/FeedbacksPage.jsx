import { useEffect, useState } from "react";
import {
    getCurrentShop,
    getProducts,
    getRatings,
} from "../data/catalog";

// Renders filled/half/empty stars for a numeric average
function StarDisplay({ value, size = "text-lg" }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (value >= i) {
            stars.push(<span key={i} className={`${size} text-amber-400`}>★</span>);
        } else if (value >= i - 0.5) {
            stars.push(<span key={i} className={`${size} text-amber-400`}>½</span>);
        } else {
            stars.push(<span key={i} className={`${size} text-gray-300`}>★</span>);
        }
    }
    return <span className="inline-flex gap-0.5">{stars}</span>;
}

function FeedbacksPage() {
    const currentShop = getCurrentShop();
    const [allRatings, setAllRatings] = useState([]);
    const [products, setProducts] = useState([]);

    function load() {
        setAllRatings(getRatings());
        setProducts(getProducts());
    }

    useEffect(() => {
        load();
        window.addEventListener("ratings:updated", load);
        return () => window.removeEventListener("ratings:updated", load);
    }, []);

    // ── Shop ratings ──────────────────────────────────────────────────────────
    const shopRatings = allRatings.filter(
        (r) => r.type === "shop" && r.targetId === currentShop?.id
    );
    const shopAvg =
        shopRatings.length > 0
            ? Math.round(
                  (shopRatings.reduce((s, r) => s + r.stars, 0) / shopRatings.length) * 10
              ) / 10
            : null;

    // ── Product ratings (only products belonging to this shop) ─────────────────
    const shopProductIds = new Set(
        products.filter((p) => p.shopId === currentShop?.id).map((p) => p.id)
    );
    const productRatings = allRatings.filter(
        (r) => r.type === "product" && shopProductIds.has(r.targetId)
    );
    const productAvg =
        productRatings.length > 0
            ? Math.round(
                  (productRatings.reduce((s, r) => s + r.stars, 0) / productRatings.length) * 10
              ) / 10
            : null;

    // Map productId → name for display
    const productNameMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

    function renderStars(n) {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < n ? "text-amber-400" : "text-gray-300"}>
                ★
            </span>
        ));
    }

    if (!currentShop) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-16">
                <p className="text-gray-500">No shop found for your account.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            {/* Header */}
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                    Shop admin
                </p>
                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                    Customer Feedbacks &amp; Ratings
                </h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Left: Shop Feedbacks ───────────────────────────────────── */}
                <div className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Shop Feedbacks</h2>

                    {/* General average */}
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-4">
                        {shopAvg !== null ? (
                            <>
                                <StarDisplay value={shopAvg} size="text-2xl" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {shopAvg}
                                </span>
                                <span className="text-sm text-gray-500">
                                    / 5 &nbsp;·&nbsp; {shopRatings.length}{" "}
                                    {shopRatings.length === 1 ? "review" : "reviews"}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-gray-500">No ratings yet.</span>
                        )}
                    </div>

                    {/* Individual ratings table */}
                    <div className="mt-4 max-h-72 overflow-y-auto">
                        {shopRatings.length === 0 ? (
                            <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                                No shop feedbacks yet.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="pb-2 pr-3">Customer</th>
                                        <th className="pb-2 pr-3">Stars</th>
                                        <th className="pb-2 pr-3">Feedback</th>
                                        <th className="pb-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {shopRatings.map((r) => (
                                        <tr key={r.id} className="align-top">
                                            <td className="py-3 pr-3 font-medium text-gray-900">
                                                {r.userName}
                                            </td>
                                            <td className="py-3 pr-3">
                                                <span className="inline-flex">
                                                    {renderStars(r.stars)}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-3 text-gray-600">
                                                {r.feedback ? (
                                                    r.feedback
                                                ) : (
                                                    <span className="italic text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 whitespace-nowrap text-gray-400">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* ── Right: Product Feedbacks ──────────────────────────────── */}
                <div className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Product Feedbacks</h2>

                    {/* General average across all products */}
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-4">
                        {productAvg !== null ? (
                            <>
                                <StarDisplay value={productAvg} size="text-2xl" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {productAvg}
                                </span>
                                <span className="text-sm text-gray-500">
                                    / 5 &nbsp;·&nbsp; {productRatings.length}{" "}
                                    {productRatings.length === 1 ? "review" : "reviews"}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-gray-500">No ratings yet.</span>
                        )}
                    </div>

                    {/* Individual ratings table */}
                    <div className="mt-4 max-h-72 overflow-y-auto">
                        {productRatings.length === 0 ? (
                            <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                                No product feedbacks yet.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="pb-2 pr-3">Product</th>
                                        <th className="pb-2 pr-3">Customer</th>
                                        <th className="pb-2 pr-3">Stars</th>
                                        <th className="pb-2 pr-3">Feedback</th>
                                        <th className="pb-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {productRatings.map((r) => (
                                        <tr key={r.id} className="align-top">
                                            <td className="py-3 pr-3 font-medium text-gray-900">
                                                {productNameMap[r.targetId] || "Unknown product"}
                                            </td>
                                            <td className="py-3 pr-3 text-gray-700">
                                                {r.userName}
                                            </td>
                                            <td className="py-3 pr-3">
                                                <span className="inline-flex">
                                                    {renderStars(r.stars)}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-3 text-gray-600">
                                                {r.feedback ? (
                                                    r.feedback
                                                ) : (
                                                    <span className="italic text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 whitespace-nowrap text-gray-400">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default FeedbacksPage;
