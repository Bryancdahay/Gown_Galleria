import { useState } from "react";

import {
    getStoredCart,
    getStoredOrders,
    setStoredCart,
    setStoredOrders,
} from "../data/catalog";

function CartPage() {
    const [cart, setCart] = useState(getStoredCart());
    const [message, setMessage] = useState("");
    const [removeCandidate, setRemoveCandidate] = useState(null);

    function updateQuantity(id, delta) {
        const item = cart.find((cartItem) => cartItem.id === id);

        if (item && delta < 0 && item.quantity === 1) {
            setRemoveCandidate(item);
            return;
        }

        const updatedCart = cart
            .map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                    : item
            )
            .filter((item) => item.quantity > 0);

        setCart(updatedCart);
        setStoredCart(updatedCart);
    }

    function confirmRemove() {
        if (!removeCandidate) {
            return;
        }

        const updatedCart = cart.filter((item) => item.id !== removeCandidate.id);

        setCart(updatedCart);
        setStoredCart(updatedCart);
        setRemoveCandidate(null);
    }

    function placeOrder() {
        if (!cart.length) {
            setMessage("Your cart is empty.");
            return;
        }

        const order = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            items: cart,
            total: totalPrice,
        };

        const orders = getStoredOrders();
        setStoredOrders([...orders, order]);
        setCart([]);
        setStoredCart([]);
        setMessage("Order placed successfully!");
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <h1 className="text-4xl font-bold text-gray-900">My cart</h1>
                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                </span>
            </div>

            {message && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {cart.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
                    <p className="text-lg font-semibold text-gray-700">
                        Your cart is empty
                    </p>
                    <p className="mt-2 text-gray-500">
                        Add a gown from the collection to start your order.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-28 w-28 rounded-2xl object-cover"
                            />

                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {item.name}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {item.category}
                                </p>
                                <p className="mt-2 text-lg font-semibold text-pink-600">
                                    ₱{item.price.toLocaleString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    -
                                </button>

                                <span className="min-w-8 text-center text-lg font-semibold text-gray-900">
                                    {item.quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setRemoveCandidate(item)}
                                className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-100"
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-xl font-bold text-gray-900">
                                ₱{totalPrice.toLocaleString()}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-gray-600">Delivery</span>
                            <span className="text-gray-900">Free</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">
                                Total
                            </span>
                            <span className="text-2xl font-bold text-pink-600">
                                ₱{totalPrice.toLocaleString()}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={placeOrder}
                            className="mt-6 w-full rounded-lg bg-pink-600 px-5 py-3 text-lg font-semibold text-white hover:bg-pink-700"
                        >
                            Place order
                        </button>
                    </div>
                </div>
            )}

            {removeCandidate && (
                <div className="modal-overlay z-50 bg-gray-900/50">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900">
                            Remove item?
                        </h2>
                        <p className="mt-3 text-gray-600">
                            Remove {removeCandidate.name} from your cart?
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRemoveCandidate(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemove}
                                className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default CartPage;
