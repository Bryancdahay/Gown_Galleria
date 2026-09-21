import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    convertToShopOwner,
    createShopApplication,
    getShopApplications,
    getShops,
    getUsers,
    saveShops,
    saveUsers,
} from "../data/catalog";
import { showToast } from "../utils/toast";

const emptyApplyForm = {
    shopName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
};

function ProfilePage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() =>
        JSON.parse(sessionStorage.getItem("user") || "null")
    );
    const fileInputRef = useRef(null);

    useEffect(() => {
        function handleUserUpdated() {
            setCurrentUser(JSON.parse(sessionStorage.getItem("user") || "null"));
        }
        window.addEventListener("user:updated", handleUserUpdated);
        return () => {
            window.removeEventListener("user:updated", handleUserUpdated);
        };
    }, []);

    const isSuperAdmin = currentUser?.role === "super-admin";
    const isShopAdmin = currentUser?.role === "shop-admin";

    const firstTab = isSuperAdmin ? "account" : "profile";
    const [activeTab, setActiveTab] = useState(firstTab);

    const userDetails = useMemo(() => {
        if (!currentUser) {
            return null;
        }
        const users = getUsers();
        const user = users.find(
            (entry) =>
                entry.id === currentUser.id ||
                entry.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        return user
            ? { ...user, ...currentUser, avatar: currentUser.avatar || user.avatar || "" }
            : currentUser;
    }, [currentUser]);

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [myApplication, setMyApplication] = useState(null);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [applyForm, setApplyForm] = useState(emptyApplyForm);
    const [applyError, setApplyError] = useState("");

    useEffect(() => {
        function syncApplication() {
            if (!currentUser || currentUser.role !== "customer") {
                setMyApplication(null);
                return;
            }

            const applications = getShopApplications();
            const application = applications.find(
                (app) => app.customerId === currentUser.id && !app.converted
            );
            setMyApplication(application || null);
        }

        syncApplication();

        window.addEventListener("shop-applications:updated", syncApplication);
        return () => {
            window.removeEventListener("shop-applications:updated", syncApplication);
        };
    }, [currentUser]);

    function handleApplyChange(event) {
        const { name, value } = event.target;
        setApplyForm((current) => ({ ...current, [name]: value }));
    }

    function handleOpenApply() {
        setApplyForm(emptyApplyForm);
        setApplyError("");
        setIsApplyOpen(true);
    }

    function handleCancelApply() {
        setIsApplyOpen(false);
        setApplyError("");
    }

    function handleApplySubmit(event) {
        event.preventDefault();

        const trimmedShopName = applyForm.shopName.trim();
        const trimmedOwnerName = applyForm.ownerName.trim();
        const trimmedOwnerEmail = applyForm.ownerEmail.trim();
        const trimmedPhone = applyForm.phone.trim();
        const trimmedAddress = applyForm.address.trim();

        if (!trimmedShopName || !trimmedOwnerName || !trimmedOwnerEmail || !trimmedPhone || !trimmedAddress) {
            setApplyError("Shop name, owner full name, email, phone number, and address are required.");
            return;
        }

        if (!applyForm.password) {
            setApplyError("Password is required.");
            return;
        }

        if (applyForm.password !== applyForm.confirmPassword) {
            setApplyError("Passwords do not match.");
            return;
        }

        const application = createShopApplication(
            {
                shopName: trimmedShopName,
                ownerName: trimmedOwnerName,
                ownerEmail: trimmedOwnerEmail,
                phone: trimmedPhone,
                address: trimmedAddress,
                password: applyForm.password,
            },
            currentUser
        );

        setMyApplication(application);
        setIsApplyOpen(false);
        setApplyError("");
        showToast("Application submitted. Waiting for super admin approval.");
    }

    function handleBecomeShopOwner() {
        if (!myApplication) {
            return;
        }

        const updatedUser = convertToShopOwner(myApplication.id);

        if (!updatedUser) {
            showToast("Unable to activate your shop account. Please try again.", "error");
            return;
        }

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user:updated"));
        showToast("Your shop account is now live!");
        navigate("/admin/dashboard");
    }

    const [error, setError] = useState("");

    useEffect(() => {
        if (userDetails) {
            setProfileForm({
                name: userDetails.name || "",
                email: userDetails.email || "",
                phone: userDetails.phone || "",
                address: userDetails.address || "",
                avatar: userDetails.avatar || "",
            });
        }
    }, [userDetails]);

    function handleProfileChange(event) {
        const { name, value } = event.target;
        setProfileForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Profile image size must be less than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const newAvatar = reader.result;
            setProfileForm((current) => ({ ...current, avatar: newAvatar }));
            setError("");
        };
        reader.readAsDataURL(file);
    }

    function handleRemoveAvatar() {
        setProfileForm((current) => ({ ...current, avatar: "" }));
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target;
        setPasswordForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleProfileSubmit(event) {
        event.preventDefault();
        setError("");

        if (!userDetails) {
            setError("No user logged in.");
            return;
        }

        const trimmedEmail = profileForm.email.trim();
        const trimmedName = profileForm.name.trim();

        if (!trimmedEmail) {
            setError("Email is required.");
            return;
        }

        if (!isSuperAdmin && !trimmedName) {
            setError("Username/Full name is required.");
            return;
        }

        const allUsers = getUsers();
        const emailExists = allUsers.some(
            (user) =>
                user.email.toLowerCase() === trimmedEmail.toLowerCase() &&
                user.id !== userDetails.id &&
                user.email.toLowerCase() !== userDetails.email?.toLowerCase()
        );

        if (emailExists) {
            setError("Email is already taken by another account.");
            return;
        }

        const updatedUser = {
            ...userDetails,
            name: isSuperAdmin ? userDetails.name : trimmedName,
            email: trimmedEmail,
            phone: profileForm.phone.trim(),
            address: profileForm.address.trim(),
            avatar: profileForm.avatar,
        };

        let userFound = false;
        const updatedUsers = allUsers.map((user) => {
            if (
                user.id === userDetails.id ||
                user.email.toLowerCase() === userDetails.email?.toLowerCase()
            ) {
                userFound = true;
                return updatedUser;
            }
            return user;
        });

        if (!userFound) {
            updatedUsers.push(updatedUser);
        }

        saveUsers(updatedUsers);

        if (isShopAdmin) {
            const shops = getShops();
            const updatedShops = shops.map((shop) =>
                shop.adminUserId === userDetails.id ||
                shop.email?.toLowerCase() === userDetails.email?.toLowerCase()
                    ? {
                          ...shop,
                          owner: trimmedName,
                          email: trimmedEmail,
                          phone: profileForm.phone.trim(),
                          address: profileForm.address.trim(),
                          avatar: profileForm.avatar,
                      }
                    : shop
            );
            saveShops(updatedShops);
        }

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        window.dispatchEvent(new Event("user:updated"));

        showToast("Profile picture and settings saved successfully.");
    }

    function handlePasswordSubmit(event) {
        event.preventDefault();
        setError("");

        if (!userDetails) {
            setError("No user is currently logged in.");
            return;
        }

        if (passwordForm.currentPassword !== userDetails.password) {
            setError("Current password is incorrect.");
            return;
        }

        if (!passwordForm.newPassword) {
            setError("New password is required.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        const users = getUsers();
        const updatedUsers = users.map((user) =>
            user.id === userDetails.id
                ? { ...user, password: passwordForm.newPassword }
                : user
        );

        saveUsers(updatedUsers);

        const updatedUser = {
            ...userDetails,
            password: passwordForm.newPassword,
        };

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user:updated"));

        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        showToast("Password updated successfully.");
    }

    return (
        <main className="mx-auto max-w-5xl px-6 py-16">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                    {isSuperAdmin ? "Super Admin" : isShopAdmin ? "Shop Admin" : "Customer"}
                </p>
                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                    Settings
                </h1>
            </div>

            {/* List / Tabs Navigation */}
            <div className="mb-6 flex gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab(firstTab);
                        setError("");
                    }}
                    className={`flex-1 rounded-xl px-4 py-3 font-semibold capitalize transition-colors ${
                        activeTab === firstTab
                            ? "bg-pink-600 text-white shadow-sm"
                            : "bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white"
                    }`}
                >
                    {isSuperAdmin ? "Account" : "Profile"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("security");
                        setError("");
                    }}
                    className={`flex-1 rounded-xl px-4 py-3 font-semibold transition-colors ${
                        activeTab === "security"
                            ? "bg-pink-600 text-white shadow-sm"
                            : "bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white"
                    }`}
                >
                    Security
                </button>
            </div>

            {/* Tab 1: Account (Super Admin) or Profile (Shop Admin & Customer) */}
            {activeTab === firstTab ? (
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isSuperAdmin ? "Account Settings" : "Profile Settings"}
                    </h2>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-50 p-6 border border-gray-200">
                            <p className="text-sm font-semibold text-gray-700">Profile Picture</p>

                            {profileForm.avatar ? (
                                <img
                                    src={profileForm.avatar}
                                    alt="Profile"
                                    className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-500 shadow-md"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-pink-100 text-4xl font-bold text-pink-700 shadow-sm">
                                    {userDetails?.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors"
                                >
                                    Upload New Picture
                                </button>
                                {profileForm.avatar && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Username / Full Name (For Shop Admin and Customer) */}
                        {!isSuperAdmin && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Username / Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    placeholder="Full name or username"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />
                            </div>
                        )}

                        {/* Email (For Super Admin, Shop Admin, Customer) */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        {/* Phone Number (For Super Admin, Shop Admin, Customer) */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                                placeholder="Phone number"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        {/* Address (For Shop Admin and Customer) */}
                        {!isSuperAdmin && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={profileForm.address}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your address"
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-pink-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>

                    {currentUser?.role === "customer" && (
                        <div className="mt-8 rounded-2xl border border-pink-200 bg-pink-50 p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Become a shop owner
                            </h3>

                            {!myApplication && (
                                <>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Apply to open your own shop on Gown Galleria.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleOpenApply}
                                        className="mt-4 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700"
                                    >
                                        Apply as Shop owner
                                    </button>
                                </>
                            )}

                            {myApplication?.status === "pending" && (
                                <p className="mt-1 text-sm font-medium text-yellow-700">
                                    Your application for "{myApplication.shopName}" is pending super admin review.
                                </p>
                            )}

                            {myApplication?.status === "declined" && (
                                <p className="mt-1 text-sm font-medium text-red-700">
                                    Your application for "{myApplication.shopName}" was declined.
                                </p>
                            )}

                            {myApplication?.status === "approved" && (
                                <div className="mt-1">
                                    <p className="text-sm font-medium text-green-700">
                                        Your application for "{myApplication.shopName}" was approved!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleBecomeShopOwner}
                                        className="mt-3 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                                    >
                                        Be a shop owner
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* Tab 2: Security (Password Change) */
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Security Settings
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Update your password to keep your account secure.
                    </p>

                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-pink-700"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isApplyOpen && (
                <div className="modal-overlay z-50 bg-gray-900/50" onClick={handleCancelApply}>
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Apply as Shop owner
                            </h2>
                            <button
                                type="button"
                                onClick={handleCancelApply}
                                className="text-xl font-semibold text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto pr-1">
                            {applyError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {applyError}
                                </div>
                            )}

                            <form onSubmit={handleApplySubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Shop name
                                    </label>
                                    <input
                                        name="shopName"
                                        value={applyForm.shopName}
                                        onChange={handleApplyChange}
                                        placeholder="Shop name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Shop owner full name
                                    </label>
                                    <input
                                        name="ownerName"
                                        value={applyForm.ownerName}
                                        onChange={handleApplyChange}
                                        placeholder="Shop owner full name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Shop owner email
                                    </label>
                                    <input
                                        type="email"
                                        name="ownerEmail"
                                        value={applyForm.ownerEmail}
                                        onChange={handleApplyChange}
                                        placeholder="Shop owner email"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Phone number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={applyForm.phone}
                                        onChange={handleApplyChange}
                                        placeholder="Phone number"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <input
                                        name="address"
                                        value={applyForm.address}
                                        onChange={handleApplyChange}
                                        placeholder="Address"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={applyForm.password}
                                        onChange={handleApplyChange}
                                        placeholder="Password"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Confirm password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={applyForm.confirmPassword}
                                        onChange={handleApplyChange}
                                        placeholder="Confirm password"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancelApply}
                                        className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
                                    >
                                        Submit application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default ProfilePage;

