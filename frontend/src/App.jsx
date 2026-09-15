import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerHome from "./pages/CustomerHome";
import GownsPage from "./pages/GownsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CollectionPage from "./pages/CollectionPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import AuditReportPage from "./pages/AuditReportPage";
import UserManagementPage from "./pages/UserManagementPage";
import ShopManagementPage from "./pages/ShopManagementPage";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function PublicOnlyRoute({ children }) {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

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
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (storedUser?.role !== "shop-admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

function SuperAdminOnlyRoute({ children }) {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
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
                        path="/gowns"
                        element={
                            <ProtectedRoute>
                                <GownsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/categories"
                        element={
                            <ProtectedRoute>
                                <CategoriesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/categories/:slug"
                        element={
                            <ProtectedRoute>
                                <CollectionPage />
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
            </div>
        </BrowserRouter>
    );
}

export default App;
