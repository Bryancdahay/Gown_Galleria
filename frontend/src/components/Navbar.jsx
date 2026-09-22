import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../api";
import {
    clearSession,
    ensureSeededStorage,
    getNotificationsForUser,
    getStoredCart,
    getStoredReservationCart,
    isSessionValid,
} from "../data/catalog";
import { showToast } from "../utils/toast";
import LoadingModal from "./LoadingModal";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [reservationCartCount, setReservationCartCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    function getSidebarLinkClass(path) {
        const isActive = location.pathname === path;

        return isActive
            ? "block w-full rounded-lg bg-pink-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-pink-50 hover:text-pink-600"
            : "block w-full rounded-lg bg-pink-50 px-4 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-600 hover:text-white";
    }

    useEffect(() => {
        async function checkUser() {
            try {
                ensureSeededStorage();

                if (!isSessionValid()) {
                    clearSession();
                    setUser(null);
                    showToast("This account is no longer available.", "error");
                    navigate("/login");
                    return;
                }

                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkUser();

        function updateCartCount() {
            const currentCart = getStoredCart();
            const total = Array.isArray(currentCart)
                ? currentCart.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : 0;
            setCartCount(total);

            const currentReservationCart = getStoredReservationCart();
            const reservationTotal = Array.isArray(currentReservationCart)
                ? currentReservationCart.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : 0;
            setReservationCartCount(reservationTotal);
        }

        updateCartCount();

        function updateNotifications() {
            const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
            const userNotifications = getNotificationsForUser(storedUser);
            setUnreadCount(userNotifications.filter((n) => !n.read).length);
        }

        updateNotifications();

        const handleUserUpdate = () => {
            checkUser();
            updateCartCount();
            updateNotifications();
        };

        const handleCartUpdate = () => {
            updateCartCount();
        };

        const handleNotificationsUpdate = () => {
            updateNotifications();
        };

        window.addEventListener("user:updated", handleUserUpdate);
        window.addEventListener("cart:updated", handleCartUpdate);
        window.addEventListener("reservation-cart:updated", handleCartUpdate);
        window.addEventListener("notifications:updated", handleNotificationsUpdate);
        window.addEventListener("shop-applications:updated", handleNotificationsUpdate);

        return () => {
            window.removeEventListener("user:updated", handleUserUpdate);
            window.removeEventListener("cart:updated", handleCartUpdate);
            window.removeEventListener("reservation-cart:updated", handleCartUpdate);
            window.removeEventListener("notifications:updated", handleNotificationsUpdate);
            window.removeEventListener("shop-applications:updated", handleNotificationsUpdate);
        };
    }, []);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            const token = sessionStorage.getItem("token");

            if (token) {
                await logoutUser();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            window.dispatchEvent(new Event("user:updated"));

            setUser(null);
            setLogoutConfirmOpen(false);
            setIsLoggingOut(false);
            showToast("Logged out successfully.");
            navigate("/");
        }
    }

    if (loading) {
        return (
            <nav className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white px-6 py-8 shadow-sm">
                <div className="flex items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold text-pink-600"
                    >
                        Gown Galleria
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <>
            <LoadingModal isOpen={isLoggingOut} message="Logging out..." />

            <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="fixed left-4 top-4 z-60 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-md md:hidden"
                aria-label="Toggle navigation"
            >
                Menu
            </button>

            <nav
                onClick={(event) => {
                    if (event.target.closest("a")) {
                        setMobileMenuOpen(false);
                    }
                }}
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-gray-200 bg-white/95 px-6 py-8 shadow-sm backdrop-blur-sm transition-transform md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <Link
                    to={
                        user
                            ? user.role === "customer"
                                ? "/home"
                                : "/admin/dashboard"
                            : "/"
                    }
                    className="text-2xl font-bold text-pink-600"
                >
                    Gown Galleria
                </Link>

                {user && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-pink-50 p-3">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-300"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="truncate text-xs font-medium text-pink-700 capitalize">{user.role?.replace("-", " ")}</p>
                        </div>
                    </div>
                )}

                {!user && (
                    <div className="mt-10 flex flex-col gap-2">
                        <Link
                            to="/login"
                            className={getSidebarLinkClass("/login")}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className={getSidebarLinkClass("/register")}
                        >
                            Register
                        </Link>
                    </div>
                )}

                {user && (
                    <div className="mt-6 flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-col gap-1">
                        {user.role === "customer" ? (
                            <>
                                <Link
                                    to="/home"
                                    className={getSidebarLinkClass("/home")}
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/cart"
                                    className={getSidebarLinkClass("/cart")}
                                >
                                    Cart {cartCount > 0 ? `(${cartCount})` : ""}
                                </Link>

                                <Link
                                    to="/reservation-cart"
                                    className={getSidebarLinkClass("/reservation-cart")}
                                >
                                    Reservation cart {reservationCartCount > 0 ? `(${reservationCartCount})` : ""}
                                </Link>

                                <Link
                                    to="/messages"
                                    className={getSidebarLinkClass("/messages")}
                                >
                                    Chat
                                </Link>

                                <Link
                                    to="/notifications"
                                    className={getSidebarLinkClass("/notifications")}
                                >
                                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
                                </Link>

                            </>
                        ) : (
                            <>
                                <Link
                                    to="/admin/dashboard"
                                    className={getSidebarLinkClass("/admin/dashboard")}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    to="/notifications"
                                    className={getSidebarLinkClass("/notifications")}
                                >
                                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
                                </Link>

                                {user.role === "shop-admin" && (
                                    <>
                                        <Link
                                            to="/messages"
                                            className={getSidebarLinkClass("/messages")}
                                        >
                                            Chat
                                        </Link>

                                        <Link
                                            to="/admin/inventory"
                                            className={getSidebarLinkClass("/admin/inventory")}
                                        >
                                            Inventory management
                                        </Link>

                                        <Link
                                            to="/admin/category-management"
                                            className={getSidebarLinkClass("/admin/category-management")}
                                        >
                                            Category management
                                        </Link>

                                        <Link
                                            to="/admin/feedbacks"
                                            className={getSidebarLinkClass("/admin/feedbacks")}
                                        >
                                            Customer Feedbacks &amp; Ratings
                                        </Link>
                                    </>
                                )}

                                {user.role === "super-admin" && (
                                    <Link
                                        to="/admin/user-management"
                                        className={getSidebarLinkClass("/admin/user-management")}
                                    >
                                        User management
                                    </Link>
                                )}

                                {user.role === "super-admin" && (
                                    <Link
                                        to="/admin/shop-management"
                                        className={getSidebarLinkClass("/admin/shop-management")}
                                    >
                                        Shop management
                                    </Link>
                                )}

                                {user.role === "super-admin" && (
                                    <>
                                        <Link
                                            to="/admin/audit-trail"
                                            className={getSidebarLinkClass("/admin/audit-trail")}
                                        >
                                            Audit trail
                                        </Link>

                                        <Link
                                            to="/admin/audit-report"
                                            className={getSidebarLinkClass("/admin/audit-report")}
                                        >
                                            Report
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        </div>

                        <div className="mt-auto border-t border-gray-100 pt-4">
                            <Link
                                to="/settings"
                                className={getSidebarLinkClass("/settings")}
                            >
                                Settings
                            </Link>

                            <button
                                onClick={() => setLogoutConfirmOpen(true)}
                                className="mt-1 block w-full rounded-lg bg-pink-50 px-4 py-3 text-left font-medium text-pink-600 transition-colors hover:bg-pink-600 hover:text-white"
                            >
                                Log out
                            </button>

                            {logoutConfirmOpen && createPortal(
                                <div
                                    className="modal-overlay z-9999 bg-gray-900/50"
                                    style={{ position: "fixed", inset: 0 }}
                                    onClick={() => setLogoutConfirmOpen(false)}
                                >
                                    <div
                                        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-auto rounded-2xl bg-white p-5 shadow-2xl text-center ring-1 ring-gray-200"
                                        style={{ margin: "auto" }}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Log out?
                                        </h3>
                                        <p className="mt-2 text-gray-600">
                                            Are you sure you want to log out of your account?
                                        </p>

                                        <div className="mt-5 flex justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setLogoutConfirmOpen(false)}
                                                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700"
                                            >
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

export default Navbar;
