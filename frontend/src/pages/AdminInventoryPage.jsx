import { useEffect, useState } from "react";

import {
    addAuditEntry,
    deleteProduct,
    getCategories,
    getProducts,
    upsertProduct,
} from "../data/catalog";
import { showToast } from "../utils/toast";

const emptyProduct = {
    id: "",
    name: "",
    category: "Bridal",
    price: 0,
    image: "",
    description: "",
};

function AdminInventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyProduct);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        const syncCatalog = () => {
            setCategories(getCategories());
            setProducts(getProducts());
        };

        syncCatalog();

        window.addEventListener("catalog:updated", syncCatalog);

        return () => {
            window.removeEventListener("catalog:updated", syncCatalog);
        };
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: name === "price" ? Number(value) : value,
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

        if (!form.name.trim() || !form.image.trim()) {
            return;
        }

        const productPayload = {
            ...form,
            id: editingId || `product-${Date.now()}`,
            price: Number(form.price),
        };

        const updatedProducts = upsertProduct(productPayload);
        setProducts(updatedProducts);
        addAuditEntry(
            editingId ? "Updated product" : "Added product",
            `${productPayload.name} was ${editingId ? "updated" : "added"}.`
        );
        showToast(editingId ? "Product updated successfully." : "Product added successfully.");

        setForm(emptyProduct);
        setEditingId(null);
        setIsFormOpen(false);
    }

    function handleEdit(product) {
        setEditingId(product.id);
        setForm(product);
        setImagePreview(product.image || "");
        setIsFormOpen(true);
    }

    function handleAddNew() {
        setEditingId(null);
        setForm(emptyProduct);
        setImagePreview("");
        setIsFormOpen(true);
    }

    function handleCancelForm() {
        setIsFormOpen(false);
        setEditingId(null);
        setForm(emptyProduct);
        setImagePreview("");
    }

    function handleDelete(id) {
        const product = products.find((item) => item.id === id);
        setDeleteCandidate(product || null);
    }

    function confirmDelete() {
        if (!deleteCandidate) {
            return;
        }

        const updatedProducts = deleteProduct(deleteCandidate.id);
        setProducts(updatedProducts);
        addAuditEntry(
            "Deleted product",
            `${deleteCandidate.name || "Product"} was deleted.`
        );
        showToast("Product deleted successfully.");
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
                        Inventory management
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleAddNew}
                    className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                    Add product
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Current products</h2>

                <div className="mt-5 space-y-4">
                    {products.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-gray-500">
                            This inventory is empty.
                        </div>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-200 p-3"
                            >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 rounded-xl object-cover"
                            />

                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                    {product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {product.category} • ₱{product.price.toLocaleString()}
                                </p>
                            </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(product)}
                                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(product.id)}
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
                                {editingId ? "Edit product" : "Add product"}
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
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Product name"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                >
                                    {(categories.length ? categories : [{ title: "Bridal" }]).map(
                                        (category) => (
                                            <option
                                                key={category.id || category.title}
                                                value={category.title}
                                            >
                                                {category.title}
                                            </option>
                                        )
                                    )}
                                </select>

                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="Price"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />

                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="mt-2 h-40 w-full rounded-xl object-cover"
                                    />
                                )}

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Description"
                                    rows="4"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500"
                                />

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
                                        {editingId ? "Update product" : "Save product"}
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
                            Delete product?
                        </h3>
                        <p className="mt-3 text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteCandidate.name}</span>? This action cannot be undone.
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

export default AdminInventoryPage;
