import { useEffect, useRef, useState } from "react";

import {
    addAuditEntry,
    getUsers,
    saveUsers,
} from "../data/catalog";
import { deleteRemoteUser } from "../api";
import { showToast } from "../utils/toast";

const emptyUser = {
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    avatar: "",
};

function UserManagementPage() {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const isSuperAdmin = currentUser?.role === "super-admin";
    const roleLabel = isSuperAdmin ? "Super admin" : "Shop admin";
    const targetRole = "customer";
    const entityLabel = "customer";

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyUser);
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
        const allUsers = getUsers();
        const visibleUsers = allUsers.filter((user) => user.role === targetRole);

        setUsers(visibleUsers);
    }, [targetRole]);

    function updateUsersList() {
        const allUsers = getUsers();
        const visibleUsers = allUsers.filter((user) => user.role === targetRole);

        setUsers(visibleUsers);
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
        const trimmedEmail = form.email.trim();
        const trimmedPhone = form.phone.trim();
        const trimmedAddress = form.address.trim();
        const trimmedPassword = form.password.trim();
        const trimmedConfirmPassword = form.confirmPassword.trim();

        if (!trimmedName) {
            showFormError("Full name is required.");
            return;
        }

        if (!trimmedEmail) {
            showFormError("Email is required.");
            return;
        }

        if (!trimmedPhone) {
            showFormError("Phone number is required.");
            return;
        }

        if (!trimmedAddress) {
            showFormError("Address is required.");
            return;
        }

        if (!editingId && !trimmedPassword) {
            showFormError("Password is required.");
            return;
        }

        const allUsers = getUsers();

        if (trimmedPassword || trimmedConfirmPassword) {
            if (trimmedPassword !== trimmedConfirmPassword) {
                showFormError("Passwords do not match.");
                return;
            }
        }

        if (editingId) {
            const exists = allUsers.some(
                (user) =>
                    user.email.toLowerCase() === trimmedEmail.toLowerCase() &&
                    user.id !== editingId
            );

            if (exists) {
                showFormError("Email is already taken.");
                return;
            }

            const existingUser = allUsers.find((user) => user.id === editingId);
            const nextUsers = allUsers.map((user) =>
                user.id === editingId
                    ? {
                          ...user,
                          name: trimmedName,
                          email: trimmedEmail,
                          phone: trimmedPhone,
                          address: trimmedAddress,
                          password: trimmedPassword || user.password,
                          avatar: form.avatar !== undefined ? form.avatar : user.avatar,
                      }
                    : user
            );

            saveUsers(nextUsers);
            updateUsersList();
            addAuditEntry(
                `Updated ${entityLabel} user`,
                `${existingUser?.name || entityLabel} was updated.`
            );
            showToast("User updated successfully.");
        } else {
            const emailExists = allUsers.some(
                (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase()
            );

            if (emailExists) {
                showFormError("Email is already taken.");
                return;
            }

            const newUser = {
                id: `user-${Date.now()}`,
                name: trimmedName,
                email: trimmedEmail,
                phone: trimmedPhone,
                address: trimmedAddress,
                password: trimmedPassword,
                role: targetRole,
                avatar: form.avatar || "",
            };

            const nextUsers = [...allUsers, newUser];
            saveUsers(nextUsers);
            updateUsersList();
            addAuditEntry(`Created ${entityLabel} user`, `${newUser.name} was added.`);
            showToast("User created successfully.");
        }

        setForm(emptyUser);
        setEditingId(null);
        setIsFormOpen(false);
        setFormError("");
    }

    function handleEdit(user) {
        setEditingId(user.id);
        setFormError("");
        setForm({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            address: user.address || "",
            password: user.password,
            confirmPassword: user.password,
            avatar: user.avatar || "",
        });
        setIsFormOpen(true);
    }

    function handleAddNew() {
        setEditingId(null);
        setFormError("");
        setForm(emptyUser);
        setIsFormOpen(true);
    }

    function handleCancelForm() {
        setEditingId(null);
        setFormError("");
        setForm(emptyUser);
        setIsFormOpen(false);
    }

    function handleDelete(user) {
        setDeleteCandidate(user);
    }

    function confirmDelete() {
        if (!deleteCandidate) {
            return;
        }

        const nextUsers = getUsers().filter((user) => user.id !== deleteCandidate.id);
        saveUsers(nextUsers);
        updateUsersList();
        deleteRemoteUser(deleteCandidate.email);
        addAuditEntry(
            `Deleted ${entityLabel} user`,
            `${deleteCandidate.name || "User"} was deleted.`
        );
        showToast("User deleted successfully.");
        setDeleteCandidate(null);
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        {roleLabel}
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        User management
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleAddNew}
                    className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                    Add customer
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                    Customer users
                </h2>

                <div className="mt-5 space-y-3">
                    {users.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-gray-500">
                            No customer users yet.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        {user.phone && (
                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(user)}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
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
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? "Edit customer" : "Add customer"}
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
                                            {form.name ? form.name.charAt(0).toUpperCase() : "U"}
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
                                        Full name
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Full name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Email"
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
                                        value={form.phone}
                                        onChange={handleChange}
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
                                        value={form.address}
                                        onChange={handleChange}
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
                                        {editingId ? "Update customer" : "Create customer"}
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
                        <h3 className="text-xl font-bold text-gray-900">
                            Delete customer?
                        </h3>
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

export default UserManagementPage;
