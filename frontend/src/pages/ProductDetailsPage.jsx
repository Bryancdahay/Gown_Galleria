import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getProducts,
    getShops,
    getStoredCart,
    setStoredCart,
} from "../data/catalog";
import { showToast } from "../utils/toast";

function ProductDetailsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [products] = useState(() => getProducts());
    const [shops] = useState(() => getShops());
    const [quantity, setQuantity] = useState(1);
    const product = products.find((item) => item.id === productId);
    const shop = shops.find((item) => item.id === product?.shopId);

    if (!product) {
        return (
            <main className="mx-auto max-w-5xl px-6 py-16">
                <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="font-semibold text-pink-600 hover:text-pink-700"
                >
                    Back to products
                </button>
                <h1 className="mt-8 text-3xl font-bold text-gray-900">
                    Product not found
                </h1>
            </main>
        );
    }

    const sellerName = product.shopName || shop?.name || "Shop";
    const shopKey = product.shopId || product.shopName || "shop";

    function addToCart() {
        const cart = getStoredCart();
        const existingItem = cart.find((item) => item.id === product.id);
        const updatedCart = existingItem
            ? cart.map((item) =>
                  item.id === product.id
                      ? { ...item, quantity: item.quantity + quantity }
                      : item
              )
                        : [...cart, { ...product, quantity }];

        setStoredCart(updatedCart);
        showToast(`${quantity} ${product.name} added to cart.`);
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-8 font-semibold text-gray-600 hover:text-pink-600"
            >
                ← Back
            </button>

            <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex min-h-105 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 p-4 shadow-sm ring-1 ring-gray-100">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-170 w-full object-contain"
                    />
                </div>

                <div className="py-2">
                    <p className="text-lg font-semibold text-pink-600">
                        ₱{product.price.toLocaleString()}
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        {product.name}
                    </h1>

                    <div className="mt-5 flex items-center gap-3">
                        <span className="text-amber-400" aria-label="No reviews yet">
                            ☆☆☆☆☆
                        </span>
                        <span className="text-sm text-gray-500">No reviews yet</span>
                    </div>

                    <p className="mt-6 leading-7 text-gray-600">
                        {product.description || "No product description yet."}
                    </p>

                    <div className="mt-8">
                        <p className="mb-2 text-sm font-semibold text-gray-700">
                            Quantity
                        </p>
                        <div className="mb-4 flex w-fit items-center rounded-lg border border-pink-200 bg-white">
                            <button
                                type="button"
                                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                className="flex rounded-l-lg h-11 w-11 items-center justify-center text-xl font-semibold text-pink-600 hover:bg-pink-50"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="min-w-12 text-center text-lg font-semibold text-gray-900">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((value) => value + 1)}
                                className="flex rounded-r-lg h-11 w-11 items-center justify-center text-xl font-semibold text-pink-600 hover:bg-pink-50"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={addToCart}
                                className="rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700"
                            >
                                Add to cart
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/messages?shopId=${encodeURIComponent(shopKey)}&shopName=${encodeURIComponent(sellerName)}`)}
                                className="rounded-lg border border-pink-200 px-6 py-3 font-semibold text-pink-600 hover:bg-pink-50"
                            >
                                Chat seller
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-gray-200 pt-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
                            Sold by
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate(`/shops/${encodeURIComponent(shopKey)}`)}
                            className="mt-2 text-left text-lg font-semibold text-pink-600 hover:text-pink-700"
                        >
                            {sellerName}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ProductDetailsPage;