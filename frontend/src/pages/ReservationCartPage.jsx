import { useEffect, useState } from "react";

import {
    getStoredOrders,
    getStoredReservationCart,
    setStoredOrders,
    setStoredReservationCart,
} from "../data/catalog";

function ReservationCartPage() {
    const [cart, setCart] = useState(() => getStoredReservationCart());
    const [removeCandidate, setRemoveCandidate] = useState(null);
    const [message, setMessage] = useState("");
    const [fulfillment, setFulfillment] = useState("pickup");

    useEffect(() => {
        const handleCartUpdate = () => {
            setCart(getStoredReservationCart());
        };
        handleCartUpdate();
        window.addEventListener("user:updated", handleCartUpdate);
        window.addEventListener("reservation-cart:updated", handleCartUpdate);
        return () => {
            window.removeEventListener("user:updated", handleCartUpdate);
            window.removeEventListener("reservation-cart:updated", handleCartUpdate);
        };
    }, []);

    function updateQuantity(id, size, delta) {
        const item = cart.find((cartItem) => cartItem.id === id && cartItem.size === size);

        if (item && delta < 0 && item.quantity === 1) {
            setRemoveCandidate(item);
            return;
        }

        const updatedCart = cart
            .map((item) =>
                item.id === id && item.size === size
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                    : item
            )
            .filter((item) => item.quantity > 0);

        setCart(updatedCart);
        setStoredReservationCart(updatedCart);
    }

    function confirmRemove() {
        if (!removeCandidate) {
            return;
        }

        const updatedCart = cart.filter(
            (item) => !(item.id === removeCandidate.id && item.size === removeCandidate.size)
        );

        setCart(updatedCart);
        setStoredReservationCart(updatedCart);
        setRemoveCandidate(null);
    }

    function updateDuration(id, size, field, value) {
        const updatedCart = cart.map((item) =>
            item.id === id && item.size === size ? { ...item, [field]: value } : item
        );

        setCart(updatedCart);
        setStoredReservationCart(updatedCart);
    }

    function reserveItems() {
        if (!cart.length) {
            setMessage("Your reservation cart is empty.");
            return;
        }

        const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");

        const order = {
            id: crypto.randomUUID(),
            type: "reservation",
            userId: currentUser?.id || currentUser?.email || "guest",
            customerName: currentUser?.name || "Customer",
            customerEmail: currentUser?.email || "",
            fulfillment,
            createdAt: new Date().toISOString(),
            items: cart,
            total: totalPrice,
        };

        const orders = getStoredOrders();
        setStoredOrders([...orders, order]);
        setCart([]);
        setStoredReservationCart([]);
        setMessage("Items reserved successfully!");
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <h1 className="text-4xl font-bold text-gray-900">Reservation cart</h1>
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
                        Your reservation cart is empty
                    </p>
                    <p className="mt-2 text-gray-500">
                        Reserve a gown from the collection to hold it for later.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map((item) => (
                        <div
                            key={`${item.id}_${item.size || "no-size"}`}
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
                                {item.size && (
                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                        Size: {item.size}
                                    </p>
                                )}
                                <p className="mt-2 text-lg font-semibold text-pink-600">
                                    ₱{item.price.toLocaleString()}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        From
                                        <input
                                            type="date"
                                            value={item.reservationFrom || ""}
                                            onChange={(event) =>
                                                updateDuration(item.id, item.size, "reservationFrom", event.target.value)
                                            }
                                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500"
                                        />
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        Until
                                        <input
                                            type="date"
                                            value={item.reservationUntil || ""}
                                            min={item.reservationFrom || undefined}
                                            onChange={(event) =>
                                                updateDuration(item.id, item.size, "reservationUntil", event.target.value)
                                            }
                                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.size, -1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    -
                                </button>

                                <span className="min-w-8 text-center text-lg font-semibold text-gray-900">
                                    {item.quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.size, 1)}
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
                            <span className="text-lg font-semibold text-gray-900">
                                Total reserved
                            </span>
                            <span className="text-2xl font-bold text-pink-600">
                                ₱{totalPrice.toLocaleString()}
                            </span>
                        </div>

                        <div className="mt-5">
                            <p className="mb-2 text-sm font-semibold text-gray-700">
                                Order method
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFulfillment("pickup")}
                                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                                        fulfillment === "pickup"
                                            ? "border-pink-600 bg-pink-600 text-white"
                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Pick up
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFulfillment("delivery")}
                                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                                        fulfillment === "delivery"
                                            ? "border-pink-600 bg-pink-600 text-white"
                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    Delivery
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={reserveItems}
                            className="mt-6 w-full rounded-lg bg-pink-600 px-5 py-3 text-lg font-semibold text-white hover:bg-pink-700"
                        >
                            Reserve items
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
                            Remove {removeCandidate.name} from your reservation cart?
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

export default ReservationCartPage;
