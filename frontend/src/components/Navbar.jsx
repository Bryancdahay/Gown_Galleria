import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../api";
import { ensureSeededStorage } from "../data/catalog";
import { showToast } from "../utils/toast";
import LoadingModal from "./LoadingModal";

function Navbar() {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        async function checkUser() {
            try {
                ensureSeededStorage();
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
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

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

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
            setMenuOpen(false);
            setLogoutConfirmOpen(false);
            setIsLoggingOut(false);
            showToast("Logged out successfully.");
            navigate("/");
        }
    }

    if (loading) {
        return (
            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
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

            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
                        >
                            Register
                        </Link>
                    </div>
                )}

                {user && (
                    <div className="flex items-center gap-6">
                        {user.role === "customer" ? (
                            <>
                                <Link
                                    to="/home"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/gowns"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Gowns
                                </Link>

                                <Link
                                    to="/categories"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Categories
                                </Link>

                                <Link
                                    to="/cart"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    My cart
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/admin/dashboard"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Dashboard
                                </Link>

                                {user.role === "shop-admin" && (
                                    <>
                                        <Link
                                            to="/admin/inventory"
                                            className="text-gray-700 hover:text-pink-600"
                                        >
                                            Inventory management
                                        </Link>

                                        <Link
                                            to="/admin/category-management"
                                            className="text-gray-700 hover:text-pink-600"
                                        >
                                            Category management
                                        </Link>
                                    </>
                                )}

                                {(user.role === "shop-admin" || user.role === "super-admin") && (
                                    <Link
                                        to="/admin/user-management"
                                        className="text-gray-700 hover:text-pink-600"
                                    >
                                        User management
                                    </Link>
                                )}

                                {user.role === "super-admin" && (
                                    <Link
                                        to="/admin/shop-management"
                                        className="text-gray-700 hover:text-pink-600"
                                    >
                                        Shop management
                                    </Link>
                                )}

                                <Link
                                    to="/admin/audit-trail"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Audit trail
                                </Link>

                                <Link
                                    to="/admin/audit-report"
                                    className="text-gray-700 hover:text-pink-600"
                                >
                                    Audit report
                                </Link>
                            </>
                        )}

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                                aria-label="Open menu"
                            >
                                <div className="space-y-1">
                                    <span className="block h-0.5 w-5 bg-current" />
                                    <span className="block h-0.5 w-5 bg-current" />
                                    <span className="block h-0.5 w-5 bg-current" />
                                </div>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                                    <Link
                                        to="/settings"
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Settings
                                    </Link>

                                    <div className="my-1 h-px bg-gray-200" />

                                    <button
                                        onClick={() => setLogoutConfirmOpen(true)}
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}

                            {logoutConfirmOpen && (
                                <div
                                    className="fixed inset-0 z-9999 flex items-center justify-center bg-gray-900/50 p-4"
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
                                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
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
            </div>
            </nav>
        </>
    );
}

export default Navbar;
