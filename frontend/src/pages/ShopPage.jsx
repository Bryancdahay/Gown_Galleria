import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCategories, getProducts, getShops } from "../data/catalog";

function ShopPage() {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const [products] = useState(() => getProducts());
    const [shopCategories] = useState(() => getCategories());
    const [shops] = useState(() => getShops());
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeSection, setActiveSection] = useState("gowns");

    const decodedShopId = decodeURIComponent(shopId || "shop");
    const shop = shops.find(
        (item) => item.id === decodedShopId || item.name === decodedShopId
    );
    const resolvedShopId = shop?.id || decodedShopId;
    const resolvedShopName = shop?.name || decodedShopId;
    const shopName = resolvedShopName || "Shop";
    const shopProducts = products.filter(
        (product) =>
            product.shopId === resolvedShopId ||
            product.shopName === resolvedShopName ||
            product.shopName === decodedShopId
    );
    const categories = useMemo(
        () => [
            ...new Set([
                ...shopCategories
                    .filter((category) => category.shopId === resolvedShopId)
                    .map((category) => category.title),
                ...shopProducts.map((product) => product.category),
            ]),
        ],
        [shopCategories, shopProducts, resolvedShopId]
    );
    const selectedCategoryRecord = shopCategories.find(
        (category) =>
            category.shopId === resolvedShopId &&
            [category.title, category.slug, category.id].includes(selectedCategory)
    );
    const selectedCategoryValues = selectedCategoryRecord
        ? [
              selectedCategoryRecord.title,
              selectedCategoryRecord.slug,
              selectedCategoryRecord.id,
          ].filter(Boolean)
        : [selectedCategory];
    const visibleProducts = shopProducts.filter(
        (product) =>
            selectedCategory === "all" ||
            selectedCategoryValues.includes(product.category)
    );

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-2 font-semibold text-gray-600 hover:text-pink-600"
            >
                ← Back
            </button>

            <header className="border-b border-gray-200 pb-4">
                <h1 className="mt-2 text-4xl font-bold text-gray-900">{shopName}</h1>
                {shop?.address && <p className="mt-2 text-gray-500">{shop.address}</p>}
            </header>

            <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 py-4">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCategory("all");
                        setActiveSection("gowns");
                    }}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${activeSection === "gowns" && selectedCategory === "all" ? "bg-pink-600 text-white" : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"}`}
                >
                    All gowns
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection("categories")}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${activeSection === "categories" ? "bg-pink-600 text-white" : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"}`}
                >
                    Categories
                </button>
            </nav>

            <section className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900">Content</h2>
            </section>

            {activeSection === "categories" ? (
                <section className="mt-5">
                    <h3 className="text-xl font-bold text-gray-900">Shop categories</h3>
                    {categories.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                            This shop has no categories yet.
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setActiveSection("gowns");
                                    }}
                                    className="rounded-xl bg-white p-6 text-left font-semibold text-gray-900 shadow-sm ring-1 ring-gray-100 hover:ring-pink-200 hover:text-pink-600"
                                >
                                    {category}
                                    <span className="mt-2 block text-sm font-normal text-gray-500">
                                        Browse gowns in this category
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            ) : visibleProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                    This shop has no gowns in this category yet.
                </div>
            ) : (
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {visibleProducts.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-gray-100 hover:ring-pink-200"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-44 w-full bg-gray-50 object-contain"
                            />
                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                                <span className="truncate text-base font-bold text-gray-900">
                                    {product.name}
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-pink-600">
                                    ₱{product.price.toLocaleString()}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </main>
    );
}

export default ShopPage;