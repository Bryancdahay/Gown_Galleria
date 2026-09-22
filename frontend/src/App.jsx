import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import { clearSession, isSessionValid } from "./data/catalog";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerHome from "./pages/CustomerHome";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import ReservationCartPage from "./pages/ReservationCartPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import AuditReportPage from "./pages/AuditReportPage";
import UserManagementPage from "./pages/UserManagementPage";
import ShopManagementPage from "./pages/ShopManagementPage";
import FeedbacksPage from "./pages/FeedbacksPage";

function ProtectedRoute({ children }) {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isSessionValid()) {
        clearSession();
        return <Navigate to="/login" replace />;
    }

    return children;
}

function PublicOnlyRoute({ children }) {
    const token = sessionStorage.getItem("token");
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

    if (token) {
        return (
            <Navigate
                to={storedUser?.role === "customer" ? "/home" : "/admin/dashboard"}
                replace
            />
        );
    }

    return children;
}

function ShopAdminOnlyRoute({ children }) {
    const token = sessionStorage.getItem("token");
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isSessionValid()) {
        clearSession();
        return <Navigate to="/login" replace />;
    }

    if (storedUser?.role !== "shop-admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

function SuperAdminOnlyRoute({ children }) {
    const token = sessionStorage.getItem("token");
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isSessionValid()) {
        clearSession();
        return <Navigate to="/login" replace />;
    }

    if (storedUser?.role !== "super-admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <ToastContainer />
                <Navbar />

                <main className="min-h-screen md:ml-72">
                    <Routes>
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <PublicOnlyRoute>
                                <Register />
                            </PublicOnlyRoute>
                        }
                    />

                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <CustomerHome />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <CartPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reservation-cart"
                        element={
                            <ProtectedRoute>
                                <ReservationCartPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products/:productId"
                        element={
                            <ProtectedRoute>
                                <ProductDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/shops/:shopId"
                        element={
                            <ProtectedRoute>
                                <ShopPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/inventory"
                        element={
                            <ProtectedRoute>
                                <ShopAdminOnlyRoute>
                                    <AdminInventoryPage />
                                </ShopAdminOnlyRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/category-management"
                        element={
                            <ProtectedRoute>
                                <ShopAdminOnlyRoute>
                                    <CategoryManagementPage />
                                </ShopAdminOnlyRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/feedbacks"
                        element={
                            <ProtectedRoute>
                                <ShopAdminOnlyRoute>
                                    <FeedbacksPage />
                                </ShopAdminOnlyRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/audit-trail"
                        element={
                            <ProtectedRoute>
                                <AuditTrailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/audit-report"
                        element={
                            <ProtectedRoute>
                                <AuditReportPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/shop-management"
                        element={
                            <ProtectedRoute>
                                <SuperAdminOnlyRoute>
                                    <ShopManagementPage />
                                </SuperAdminOnlyRoute>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/user-management"
                        element={
                            <ProtectedRoute>
                                <UserManagementPage />
                            </ProtectedRoute>
                        }
                    />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
