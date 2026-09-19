import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../api";
import { ensureSeededStorage } from "../data/catalog";
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

    function getSidebarLinkClass(path) {
        const isActive = location.pathname === path;

        return isActive
            ? "rounded-lg bg-pink-600 px-4 py-3 text-white shadow-sm"
            : "rounded-lg px-4 py-3 text-pink-600 hover:bg-pink-50";
    }

    useEffect(() => {
        async function checkUser() {
            try {
                ensureSeededStorage();
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkUser();

        const handleUserUpdate = () => {
            checkUser();
        };

        window.addEventListener("user:updated", handleUserUpdate);

        return () => {
            window.removeEventListener("user:updated", handleUserUpdate);
        };
    }, []);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            const token = localStorage.getItem("token");

            if (token) {
                await logoutUser();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

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
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white/95 px-6 py-8 shadow-sm backdrop-blur-sm transition-transform md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                    <div className="mt-10 flex min-h-0 flex-1 flex-col">
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
                                    Cart
                                </Link>

                                <Link
                                    to="/messages"
                                    className={getSidebarLinkClass("/messages")}
                                >
                                    Messages
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

                                {user.role === "shop-admin" && (
                                    <>
                                        <Link
                                            to="/messages"
                                            className={getSidebarLinkClass("/messages")}
                                        >
                                            Messages
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
                                    Audit report
                                </Link>
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
                                className="mt-1 block w-full rounded-lg px-4 py-3 text-left font-medium text-pink-600 hover:bg-pink-50"
                            >
                                Log out
                            </button>

                            {logoutConfirmOpen && (
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
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

export default Navbar;
