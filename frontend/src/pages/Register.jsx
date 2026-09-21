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
        phone: "",
        address: "",
        password: "",
        password_confirmation: "",
        avatar: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function showError(message) {
        setError(message);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showError("Profile image size must be less than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, avatar: reader.result }));
                setError("");
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!formData.name.trim()) {
            showError("Full name is required.");
            return;
        }

        if (!formData.email.trim()) {
            showError("Email is required.");
            return;
        }

        if (!formData.phone.trim()) {
            showError("Phone number is required.");
            return;
        }

        if (!formData.address.trim()) {
            showError("Address is required.");
            return;
        }

        if (!formData.password.trim()) {
            showError("Password is required.");
            return;
        }

        if (!formData.password_confirmation.trim()) {
            showError("Confirm password is required.");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            showError("Passwords do not match.");
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
                    showError("Email is already taken.");
                    return;
                }

                if (errors.name) {
                    showError("Full name is required.");
                    return;
                }

                const firstError = Object.values(errors)[0]?.[0];

                showError(firstError || "Registration failed.");
            } else if (error.message) {
                showError(error.message);
            } else {
                showError("Registration failed.");
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
                    <div className="flex flex-col items-center justify-center gap-3">
                        {formData.avatar ? (
                            <img
                                src={formData.avatar}
                                alt="Avatar preview"
                                className="h-24 w-24 rounded-full object-cover ring-2 ring-pink-500"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-600">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                            </div>
                        )}
                        <label className="cursor-pointer text-sm font-semibold text-pink-600 hover:text-pink-700">
                            <span>Upload profile picture</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>
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
                            Phone number
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="09XX XXX XXXX"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Address
                        </label>

                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Your address"
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
