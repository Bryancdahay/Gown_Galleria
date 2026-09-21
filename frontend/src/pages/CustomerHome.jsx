import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../data/catalog";

function CustomerHome() {
    const navigate = useNavigate();
    const [products, setProducts] = useState(() => getProducts());
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        function syncProducts() {
            setProducts(getProducts());
        }

        window.addEventListener("catalog:updated", syncProducts);

        return () => window.removeEventListener("catalog:updated", syncProducts);
    }, []);

    const categories = [...new Set(products.map((product) => product.category))];
    const filteredProducts = products.filter((product) => {
        const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        Find your perfect gown
                    </h1>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <label className="relative">
                        <span className="sr-only">Search products</span>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search products"
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none ring-pink-200 placeholder:text-gray-400 focus:ring-2 sm:w-64"
                        />
                    </label>

                    <label>
                        <span className="sr-only">Filter by category</span>
                        <select
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none ring-pink-200 focus:ring-2 sm:w-48"
                        >
                            <option value="all">All categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                    No products match your search.
                </div>
            ) : (
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <article
                            key={product.id}
                            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
                        >
                            <button
                                type="button"
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="block w-full"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-44 w-full bg-gray-50 object-contain"
                                />
                            </button>

                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                                <h2 className="truncate text-base font-bold text-gray-900">
                                    {product.name}
                                </h2>
                                <span className="shrink-0 text-sm font-semibold text-pink-600">
                                    ₱{product.price.toLocaleString()}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default CustomerHome;
