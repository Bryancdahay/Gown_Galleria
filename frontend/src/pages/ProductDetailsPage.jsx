import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getProducts,
    getShops,
    getStoredCart,
    getStoredReservationCart,
    setStoredCart,
    setStoredReservationCart,
    getRatingsForTarget,
    addOrUpdateRating,
} from "../data/catalog";
import { showToast } from "../utils/toast";

// ── Reusable star-picker ──────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-2xl leading-none focus:outline-none"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                    <span className={(hovered || value) >= star ? "text-amber-400" : "text-gray-300"}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
}

// ── Scrollable ratings list ───────────────────────────────────────────────────
function RatingsList({ ratings }) {
    if (ratings.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">No feedback yet.</p>
        );
    }
    return (
        <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {ratings.map((r) => (
                <div key={r.id} className="rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{r.userName}</span>
                        <span className="flex text-amber-400 text-sm">
                            {"★".repeat(r.stars)}
                            <span className="text-gray-300">{"★".repeat(5 - r.stars)}</span>
                        </span>
                    </div>
                    {r.feedback ? (
                        <p className="mt-1 text-sm text-gray-600">{r.feedback}</p>
                    ) : (
                        <p className="mt-1 text-xs italic text-gray-400">No written feedback.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Rating submit form ────────────────────────────────────────────────────────
function RatingForm({ type, targetId, onSubmitted }) {
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        if (stars === 0) {
            showToast("Please select a star rating.", "error");
            return;
        }
        addOrUpdateRating({ type, targetId, stars, feedback });
        showToast("Thank you for your feedback!");
        // Reset form so the user can send another rating
        setStars(0);
        setFeedback("");
        if (onSubmitted) onSubmitted();
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">
                {"Rate this " + (type === "product" ? "product" : "shop")}
            </p>
            <StarPicker value={stars} onChange={setStars} />
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write a feedback (optional)..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
            <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
            >
                Send
            </button>
        </form>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ProductDetailsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [products] = useState(() => getProducts());
    const [shops] = useState(() => getShops());
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [productRatings, setProductRatings] = useState([]);
    const [shopRatings, setShopRatings] = useState([]);
    const [ratingsVersion, setRatingsVersion] = useState(0);

    const product = products.find((item) => item.id === productId);
    const shop = shops.find((item) => item.id === product?.shopId);

    const reloadRatings = useCallback(() => {
        if (!product) return;
        setProductRatings(getRatingsForTarget("product", product.id));
        if (shop) setShopRatings(getRatingsForTarget("shop", shop.id));
        setRatingsVersion((v) => v + 1);
    }, [product, shop]);

    useEffect(() => {
        const refreshFrame = window.requestAnimationFrame(reloadRatings);
        window.addEventListener("ratings:updated", reloadRatings);
        return () => {
            window.cancelAnimationFrame(refreshFrame);
            window.removeEventListener("ratings:updated", reloadRatings);
        };
    }, [productId, reloadRatings]);

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
    const availableSizes = product.sizes || [];

    const productAvg = productRatings.length > 0
        ? Math.round((productRatings.reduce((s, r) => s + r.stars, 0) / productRatings.length) * 10) / 10
        : null;
    const shopAvg = shopRatings.length > 0
        ? Math.round((shopRatings.reduce((s, r) => s + r.stars, 0) / shopRatings.length) * 10) / 10
        : null;

    function addToCart() {
        if (availableSizes.length && !selectedSize) {
            showToast("Please select a size.", "error");
            return;
        }

        const cart = getStoredCart();
        const existingItem = cart.find(
            (item) => item.id === product.id && item.size === selectedSize
        );
        const updatedCart = existingItem
            ? cart.map((item) =>
                  item.id === product.id && item.size === selectedSize
                      ? { ...item, quantity: item.quantity + quantity }
                      : item
              )
            : [...cart, { ...product, quantity, size: selectedSize || null }];

        setStoredCart(updatedCart);
        showToast(`${quantity} ${product.name} added to cart.`);
    }

    function addToReservationCart() {
        if (availableSizes.length && !selectedSize) {
            showToast("Please select a size.", "error");
            return;
        }

        const reservationCart = getStoredReservationCart();
        const existingItem = reservationCart.find(
            (item) => item.id === product.id && item.size === selectedSize
        );
        const updatedCart = existingItem
            ? reservationCart.map((item) =>
                  item.id === product.id && item.size === selectedSize
                      ? { ...item, quantity: item.quantity + quantity }
                      : item
              )
            : [
                  ...reservationCart,
                  {
                      ...product,
                      quantity,
                      size: selectedSize || null,
                      reservationFrom: "",
                      reservationUntil: "",
                  },
              ];

        setStoredReservationCart(updatedCart);
        showToast(`${quantity} ${product.name} added to reservation cart.`);
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

            <section className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="flex min-h-105 items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:min-h-135">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-125 w-full object-contain lg:max-h-145"
                    />
                </div>

                <div className="flex flex-col justify-center py-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        {product.category || "Gown"}
                    </p>
                    <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
                        {product.name}
                    </h1>
                    <p className="mt-5 text-3xl font-bold text-gray-900">
                        ₱{product.price.toLocaleString()}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {productAvg !== null ? (
                            <>
                                <span className="text-amber-400" aria-label={`${productAvg} stars`}>
                                    {"★".repeat(Math.round(productAvg))}{"☆".repeat(5 - Math.round(productAvg))}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {productAvg} / 5 &nbsp;·&nbsp; {productRatings.length}{" "}
                                    {productRatings.length === 1 ? "review" : "reviews"}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-amber-400" aria-label="No reviews yet">☆☆☆☆☆</span>
                                <span className="text-sm text-gray-500">No reviews yet</span>
                            </>
                        )}
                    </div>

                    <p className="mt-6 max-w-2xl leading-7 text-gray-600">
                        {product.description || "No product description yet."}
                    </p>
                </div>
            </section>

            <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    {availableSizes.length > 0 && (
                        <div>
                            <p className="mb-3 text-sm font-semibold text-gray-700">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                                            selectedSize === size
                                                ? "border-pink-600 bg-pink-600 text-white"
                                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={availableSizes.length ? "lg:justify-self-end" : ""}>
                        <p className="mb-3 text-sm font-semibold text-gray-700">Quantity</p>
                        <div className="flex w-fit items-center rounded-lg border border-pink-200 bg-white">
                            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-l-lg text-xl font-semibold text-pink-600 hover:bg-pink-50" aria-label="Decrease quantity">−</button>
                            <span className="min-w-12 text-center text-lg font-semibold text-gray-900">{quantity}</span>
                            <button type="button" onClick={() => setQuantity((value) => value + 1)} className="flex h-11 w-11 items-center justify-center rounded-r-lg text-xl font-semibold text-pink-600 hover:bg-pink-50" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                    <button type="button" onClick={addToCart} className="rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700">Add to cart</button>
                    <button type="button" onClick={addToReservationCart} className="rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700">Add to reservation cart</button>
                    <button type="button" onClick={() => navigate(`/messages?shopId=${encodeURIComponent(shopKey)}&shopName=${encodeURIComponent(sellerName)}`)} className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Chat shop</button>
                </div>
            </section>

            <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
                        <h3 className="text-base font-bold text-gray-900">
                            Product Ratings &amp; Feedback
                        </h3>
                        <div className="mt-3">
                            <RatingsList ratings={productRatings} />
                        </div>
                        <RatingForm
                            key={`product-${ratingsVersion}`}
                            type="product"
                            targetId={product.id}
                            onSubmitted={reloadRatings}
                        />
            </section>

            <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
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

                        {shop && (
                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                {shop.owner && <p>Owner: {shop.owner}</p>}
                                {shop.email && <p>Email: {shop.email}</p>}
                                {shop.phone && <p>Phone: {shop.phone}</p>}
                                {shop.address && <p>Address: {shop.address}</p>}
                            </div>
                        )}
                </div>

                {shop && (
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
                            <h3 className="text-base font-bold text-gray-900">
                                Shop Ratings &amp; Feedback
                            </h3>

                            {/* General shop average */}
                            <div className="mt-2 flex items-center gap-2">
                                {shopAvg !== null ? (
                                    <>
                                        <span className="text-amber-400">
                                            {"★".repeat(Math.round(shopAvg))}
                                            <span className="text-gray-300">{"★".repeat(5 - Math.round(shopAvg))}</span>
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {shopAvg} / 5
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ({shopRatings.length} {shopRatings.length === 1 ? "review" : "reviews"})
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No shop ratings yet.</span>
                                )}
                            </div>

                            <div className="mt-3">
                                <RatingsList ratings={shopRatings} />
                            </div>
                            <RatingForm
                                key={`shop-${ratingsVersion}`}
                                type="shop"
                                targetId={shop.id}
                                onSubmitted={reloadRatings}
                            />
                    </div>
                )}
            </section>
        </main>
    );
}

export default ProductDetailsPage;
