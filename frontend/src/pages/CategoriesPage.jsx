import { Link } from "react-router-dom";

import { getCategories, getProducts } from "../data/catalog";

function CategoriesPage() {
    const categories = getCategories();
    const products = getProducts();

    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                Explore
            </p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Categories
            </h1>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
                {categories.map((category) => {
                    const count = products.filter(
                        (gown) => gown.category === category.title
                    ).length;

                    return (
                        <div
                            key={category.slug}
                            className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100"
                        >
                            <img
                                src={category.image}
                                alt={category.title}
                                className="h-52 w-full object-cover"
                            />

                            <div className="p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {category.title}
                                    </h2>
                                    <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700">
                                        {count} styles
                                    </span>
                                </div>

                                <p className="mt-3 text-gray-600">
                                    {category.description}
                                </p>

                                <Link
                                    to={`/categories/${category.slug}`}
                                    className="mt-5 inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    View collection
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}

export default CategoriesPage;
