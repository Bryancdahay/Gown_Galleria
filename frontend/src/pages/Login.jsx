import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { ensureSeededStorage, rememberCartOwner } from "../data/catalog";
import LoadingModal from "../components/LoadingModal";
import { showToast } from "../utils/toast";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(formData);

            ensureSeededStorage();

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            rememberCartOwner(data.user.id || data.user.email);

            window.dispatchEvent(new Event("user:updated"));

            showToast("Login successful.");
            navigate(
                data.user.role === "customer" ? "/home" : "/admin/dashboard"
            );
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingModal isOpen={loading} message="Logging in..." />

            <div className="mx-auto max-w-md px-6 py-16">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">

                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome Back
                </h1>

                <p className="mt-2 text-gray-600">
                    Sign in to your Gown Galleria account.
                </p>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                </div>
            </div>
        </>
    );
}

export default Login;
