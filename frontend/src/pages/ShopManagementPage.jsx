import { useEffect, useRef, useState } from "react";

import {
    addAuditEntry,
    getShops,
    getUsers,
    saveShops,
    saveUsers,
} from "../data/catalog";
import { deleteRemoteUser } from "../api";
import { showToast } from "../utils/toast";

const emptyShop = {
    id: "",
    name: "",
    owner: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    avatar: "",
};

function ShopManagementPage() {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const [shops, setShops] = useState([]);
    const [form, setForm] = useState(emptyShop);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [formError, setFormError] = useState("");
    const modalBodyRef = useRef(null);

    function showFormError(message) {
        setFormError(message);
        if (modalBodyRef.current) {
            modalBodyRef.current.scrollTop = 0;
        }
    }

    useEffect(() => {
        setShops(getShops());
    }, []);

    function updateShopsList() {
        setShops(getShops());
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showFormError("Profile image size must be less than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((current) => ({ ...current, avatar: reader.result }));
                setFormError("");
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedName = form.name.trim();
        const trimmedOwner = form.owner.trim();
        const trimmedEmail = form.email.trim();
        const trimmedPassword = form.password.trim();
        const trimmedConfirmPassword = form.confirmPassword.trim();
        const trimmedPhone = form.phone.trim();
        const trimmedAddress = form.address.trim();

        if (!trimmedName || !trimmedOwner || !trimmedEmail || !trimmedAddress) {
            showFormError("Shop name, shop admin full name, email, and address are required.");
            return;
        }

        if (!trimmedPhone) {
            showFormError("Phone number is required.");
            return;
        }

        if (!editingId && !trimmedPassword) {
            showFormError("Password is required when creating a shop admin account.");
            return;
        }

        if (trimmedPassword || trimmedConfirmPassword) {
            if (trimmedPassword !== trimmedConfirmPassword) {
                showFormError("Passwords do not match.");
                return;
            }
        }

        const allShops = getShops();
        const allUsers = getUsers();

        if (editingId) {
            const shop = allShops.find((item) => item.id === editingId);
            const exists = allUsers.some(
                (user) =>
                    user.email.toLowerCase() === trimmedEmail.toLowerCase() &&
                    user.id !== shop?.adminUserId
            );

            if (exists) {
                showFormError("Email is already taken by another shop admin account.");
                return;
            }

            const nextShops = allShops.map((item) =>
                item.id === editingId
                    ? {
                          ...item,
                          name: trimmedName,
                          owner: trimmedOwner,
                          email: trimmedEmail,
                          phone: trimmedPhone,
                          address: trimmedAddress,
                          avatar: form.avatar !== undefined ? form.avatar : item.avatar,
                      }
                    : item
            );

            const nextUsers = allUsers.map((user) => {
                if (user.id !== shop?.adminUserId) {
                    return user;
                }

                return {
                    ...user,
                    name: trimmedOwner,
                    email: trimmedEmail,
                    password: trimmedPassword || user.password,
                    phone: trimmedPhone,
                    address: trimmedAddress,
                    avatar: form.avatar !== undefined ? form.avatar : user.avatar,
                };
            });

            saveShops(nextShops);
            saveUsers(nextUsers);
            updateShopsList();
            addAuditEntry(
                "Updated shop",
                `${trimmedName} was updated in shop management.`
            );
            showToast("Shop updated successfully.");
        } else {
            const emailExists = allUsers.some(
                (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase()
            );

            if (emailExists) {
                showFormError("Email is already taken by another account.");
                return;
            }

            const newUser = {
                id: `shop-admin-${Date.now()}`,
                name: trimmedOwner,
                email: trimmedEmail,
                password: trimmedPassword,
                role: "shop-admin",
                phone: trimmedPhone,
                address: trimmedAddress,
                avatar: form.avatar || "",
            };

            const newShop = {
                id: `shop-${Date.now()}`,
                name: trimmedName,
                owner: trimmedOwner,
                email: trimmedEmail,
                phone: trimmedPhone,
                address: trimmedAddress,
                adminUserId: newUser.id,
                avatar: form.avatar || "",
            };

            const nextShops = [...allShops, newShop];
            const nextUsers = [...allUsers, newUser];

            saveShops(nextShops);
            saveUsers(nextUsers);
            updateShopsList();
            addAuditEntry("Created shop", `${newShop.name} was added with a login account.`);
            showToast("Shop created successfully.");
        }

        setForm(emptyShop);
        setEditingId(null);
        setIsFormOpen(false);
        setFormError("");
    }

    function handleEdit(shop) {
        setEditingId(shop.id);
        setFormError("");
        const allUsers = getUsers();
        const adminUser = allUsers.find((u) => u.id === shop.adminUserId);

        setForm({
            id: shop.id,
            name: shop.name,
            owner: shop.owner,
            email: shop.email,
            password: "",
            confirmPassword: "",
            phone: shop.phone || "",
            address: shop.address || "",
            avatar: shop.avatar || adminUser?.avatar || "",
        });
        setIsFormOpen(true);
    }

    function handleAddNew() {
        setEditingId(null);
        setFormError("");
        setForm(emptyShop);
        setIsFormOpen(true);
    }

    function handleCancelForm() {
        setEditingId(null);
        setFormError("");
        setForm(emptyShop);
        setIsFormOpen(false);
    }

    function handleDelete(shop) {
        setDeleteCandidate(shop);
    }

    function confirmDelete() {
        if (!deleteCandidate) {
            return;
        }

        const nextShops = getShops().filter((shop) => shop.id !== deleteCandidate.id);
        const nextUsers = getUsers().filter((user) => user.id !== deleteCandidate.adminUserId);
        saveShops(nextShops);
        saveUsers(nextUsers);
        updateShopsList();
        deleteRemoteUser(deleteCandidate.email);
        addAuditEntry("Deleted shop", `${deleteCandidate.name} was deleted.`);
        showToast("Shop deleted successfully.");
        setDeleteCandidate(null);
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        {currentUser?.role === "super-admin" ? "Super admin" : "Admin"}
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        Shop management
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleAddNew}
                    className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                    Add shop
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Shops</h2>

                <div className="mt-5 space-y-3">
                    {shops.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-gray-500">
                            No shops yet.
                        </div>
                    ) : (
                        shops.map((shop) => (
                            <div
                                key={shop.id}
                                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    {shop.avatar ? (
                                        <img
                                            src={shop.avatar}
                                            alt={shop.name}
                                            className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                                            {shop.name?.charAt(0)?.toUpperCase() || "S"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">{shop.name}</p>
                                        <p className="text-sm text-gray-500">{shop.owner}</p>
                                        <p className="text-sm text-gray-500">{shop.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(shop)}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(shop)}
                                        className="rounded-lg bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isFormOpen && (
                <div className="modal-overlay z-50 bg-gray-900/50">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? "Edit shop" : "Add shop"}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCancelForm}
                                className="text-xl font-semibold text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto pr-1" ref={modalBodyRef}>
                            {formError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    {form.avatar ? (
                                        <img
                                            src={form.avatar}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-full object-cover ring-2 ring-pink-500"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-xl font-bold text-pink-600">
                                            {form.name ? form.name.charAt(0).toUpperCase() : "S"}
                                        </div>
                                    )}
                                    <label className="cursor-pointer text-sm font-semibold text-pink-600 hover:text-pink-700">
                                        <span>Upload shop/profile picture</span>
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
                                        Shop name
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Shop name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Shop admin full name
                                    </label>
                                    <input
                                        name="owner"
                                        value={form.owner}
                                        onChange={handleChange}
                                        placeholder="Shop admin full name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Shop admin email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Shop admin email"
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
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder={editingId ? "Leave blank to keep current password" : "Password"}
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
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={editingId ? "Re-enter password" : "Confirm password"}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Phone"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Address"
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCancelForm}
                                        className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
                                    >
                                        {editingId ? "Update shop" : "Create shop"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {deleteCandidate && (
                <div className="modal-overlay z-50 bg-gray-900/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl text-center">
                        <h3 className="text-xl font-bold text-gray-900">Delete shop?</h3>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteCandidate.name}</span>? This action cannot be undone.
                        </p>

                        <div className="mt-5 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteCandidate(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default ShopManagementPage;
