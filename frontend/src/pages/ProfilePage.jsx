import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUsers, saveUsers } from "../data/catalog";
import { showToast } from "../utils/toast";

function ProfilePage() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const [activeTab, setActiveTab] = useState("profile");
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const userDetails = useMemo(() => {
        if (!currentUser) {
            return null;
        }

        const users = getUsers();
        const user = users.find((entry) => entry.id === currentUser.id);

        return user || currentUser;
    }, [currentUser]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handlePasswordSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!userDetails) {
            setError("No user is currently logged in.");
            return;
        }

        if (form.currentPassword !== userDetails.password) {
            setError("Current password is incorrect.");
            return;
        }

        if (!form.newPassword) {
            setError("New password is required.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        const users = getUsers();
        const updatedUsers = users.map((user) =>
            user.id === userDetails.id
                ? { ...user, password: form.newPassword }
                : user
        );

        saveUsers(updatedUsers);

        const updatedUser = {
            ...userDetails,
            password: form.newPassword,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user:updated"));

        setForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setSuccess("Password updated successfully.");
        showToast("Password updated successfully.");
    }

    const profileFields = [
        { label: "Full name", value: userDetails?.name || "-" },
        { label: "Email", value: userDetails?.email || "-" },
        { label: "Role", value: userDetails?.role || "-" },
    ];

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        Account
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        Settings
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="mb-6 flex gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
                <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
                        activeTab === "profile"
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-700"
                    }`}
                >
                    Profile
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("password")}
                    className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
                        activeTab === "password"
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-700"
                    }`}
                >
                    Change password
                </button>
            </div>

            {activeTab === "profile" ? (
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-xl font-bold text-pink-700">
                            {userDetails?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {userDetails?.name || "User"}
                            </h2>
                            <p className="text-gray-500">{userDetails?.email || "-"}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {profileFields.map((field) => (
                            <div key={field.label} className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">{field.label}</p>
                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {field.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Change password
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Current password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                New password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                        >
                            Update password
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}

export default ProfilePage;
