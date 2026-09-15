import { useEffect, useMemo, useState } from "react";
import {
    addAuditEntry,
    deleteCategory,
    getCategories,
    upsertCategory,
} from "../data/catalog";
import { showToast } from "../utils/toast";

const emptyCategory = {
    id: "",
    slug: "",
    title: "",
    image: "",
    description: "",
};

function CategoryManagementPage() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyCategory);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        setCategories(getCategories());
    }, []);

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                id: category.id,
                label: category.title,
            })),
        [categories]
    );

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleImageUpload(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            const previewUrl = typeof reader.result === "string" ? reader.result : "";
            setForm((current) => ({
                ...current,
                image: previewUrl,
            }));
            setImagePreview(previewUrl);
        };

        reader.readAsDataURL(file);
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            return;
        }

        const nextCategory = {
            ...form,
            id: editingId || `category-${Date.now()}`,
            slug: (form.slug || form.title)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
            title: form.title.trim(),
            description: form.description.trim(),
            image: form.image || "",
        };

        const updatedCategories = upsertCategory(nextCategory);
        setCategories(updatedCategories);
        addAuditEntry(
            editingId ? "Updated category" : "Added category",
            `${nextCategory.title} was ${editingId ? "updated" : "added"}.`
        );
        showToast(editingId ? "Category updated successfully." : "Category added successfully.");
        window.dispatchEvent(new Event("catalog:updated"));

        setForm(emptyCategory);
        setEditingId(null);
        setIsFormOpen(false);
        setImagePreview("");
    }

    function handleAddNew() {
        setEditingId(null);
        setForm(emptyCategory);
        setImagePreview("");
        setIsFormOpen(true);
    }

    function handleEdit(category) {
        setEditingId(category.id);
        setForm(category);
        setImagePreview(category.image || "");
        setIsFormOpen(true);
    }

    function handleCancelForm() {
        setIsFormOpen(false);
        setEditingId(null);
        setForm(emptyCategory);
        setImagePreview("");
    }

    function handleDelete(category) {
        setDeleteCandidate(category);
    }

    function confirmDelete() {
        if (!deleteCandidate) {
            return;
        }

        const updatedCategories = deleteCategory(deleteCandidate.id);
        setCategories(updatedCategories);
        addAuditEntry(
            "Deleted category",
            `${deleteCandidate.title || "Category"} was deleted.`
        );
        showToast("Category deleted successfully.");
        window.dispatchEvent(new Event("catalog:updated"));
        setDeleteCandidate(null);
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        Shop admin
                    </p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        Category management
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleAddNew}
                    className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                    Add category
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Current categories</h2>

                <div className="mt-5 space-y-4">
                    {categories.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-gray-500">
                            This category list is empty.
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-200 p-3"
                            >
                            <img
                                src={category.image || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"}
                                alt={category.title}
                                className="h-16 w-16 rounded-xl object-cover"
                            />

                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{category.title}</p>
                                <p className="text-sm text-gray-500">/{category.slug}</p>
                            </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(category)}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(category)}
                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? "Edit category" : "Add category"}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCancelForm}
                                className="text-xl font-semibold text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto pr-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category name
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Category name"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category slug
                                </label>
                                <input
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleChange}
                                    placeholder="e.g. bridal"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Category preview"
                                        className="mt-4 h-40 w-full rounded-xl object-cover"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Category description"
                                    rows="4"
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
                                        {editingId ? "Update category" : "Save category"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {deleteCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center">
                        <h3 className="text-xl font-bold text-gray-900">
                            Delete category?
                        </h3>
                        <p className="mt-3 text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteCandidate.title}</span>? This will remove it from the category list.
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
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
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
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

export default CategoryManagementPage;
