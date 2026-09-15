import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import LoadingModal from "../components/LoadingModal";
import { showToast } from "../utils/toast";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!formData.name.trim()) {
            setError("Full name is required.");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await registerUser(formData);

            setSuccess("Account created successfully!");
            showToast("Account created successfully.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;

                if (errors.email) {
                    setError("Email is already taken.");
                    return;
                }

                if (errors.name) {
                    setError("Full name is required.");
                    return;
                }

                const firstError = Object.values(errors)[0]?.[0];

                setError(firstError || "Registration failed.");
            } else if (error.message) {
                setError(error.message);
            } else {
                setError("Registration failed.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingModal isOpen={loading} message="Creating account..." />

            <div className="mx-auto max-w-md px-6 py-16">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">
                    Create Account
                </h1>

                <p className="mt-2 text-gray-600">
                    Join Gown Galleria today.
                </p>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

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
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
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
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
                </div>
            </div>
        </>
    );
}

export default Register;
