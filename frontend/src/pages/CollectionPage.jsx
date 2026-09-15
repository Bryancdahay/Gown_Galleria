import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getCategoryCollections,
    getStoredCart,
    setStoredCart,
} from "../data/catalog";

function CollectionPage() {
    const { slug } = useParams();
    const [selectedGown, setSelectedGown] = useState(null);
    const [status, setStatus] = useState("");
    const [cartPulse, setCartPulse] = useState(false);

    const collection = getCategoryCollections(slug);

    function addToCart(gown) {
        const cart = getStoredCart();
        const existingItem = cart.find((item) => item.id === gown.id);

        const updatedCart = existingItem
            ? cart.map((item) =>
                  item.id === gown.id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
              )
            : [...cart, { ...gown, quantity: 1 }];

        setStoredCart(updatedCart);
        setStatus(`${gown.name} added to cart.`);
        setCartPulse(true);

        window.setTimeout(() => {
            setStatus("");
            setCartPulse(false);
        }, 1500);
    }

    if (!collection.length) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-16">
                <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Collection not found
                    </h1>
                    <Link
                        to="/categories"
                        className="mt-5 inline-flex rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                    >
                        Back to categories
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        Collection
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        {collection[0].category}
                    </h1>
                </div>

                <Link
                    to="/categories"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Back to categories
                </Link>
            </div>

            {status && (
                <div
                    className={`mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 transition-all duration-300 ${
                        cartPulse ? "scale-[1.01] shadow-lg" : ""
                    }`}
                >
                    {status}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {collection.map((gown) => (
                    <article
                        key={gown.id}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedGown(gown)}
                            className="block w-full"
                        >
                            <img
                                src={gown.image}
                                alt={gown.name}
                                className="h-64 w-full object-cover transition duration-300 hover:scale-105"
                            />
                        </button>

                        <div className="p-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700">
                                    {gown.category}
                                </span>
                                <span className="text-sm font-semibold text-gray-500">
                                    ₱{gown.price.toLocaleString()}
                                </span>
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-gray-900">
                                {gown.name}
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                {gown.description}
                            </p>

                            <button
                                type="button"
                                onClick={() => addToCart(gown)}
                                className="mt-5 w-full rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                            >
                                Add to cart
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {selectedGown && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
                    onClick={() => setSelectedGown(null)}
                >
                    <div
                        className="relative max-w-4xl overflow-hidden rounded-3xl bg-white"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedGown(null)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow"
                        >
                            Close
                        </button>

                        <div className="grid md:grid-cols-2">
                            <img
                                src={selectedGown.image}
                                alt={selectedGown.name}
                                className="h-full max-h-[70vh] w-full object-cover"
                            />

                            <div className="p-8">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                                    {selectedGown.category}
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                                    {selectedGown.name}
                                </h2>
                                <p className="mt-4 text-lg font-semibold text-pink-600">
                                    ₱{selectedGown.price.toLocaleString()}
                                </p>
                                <p className="mt-4 text-gray-600">
                                    {selectedGown.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        addToCart(selectedGown);
                                        setSelectedGown(null);
                                    }}
                                    className="mt-6 rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default CollectionPage;
