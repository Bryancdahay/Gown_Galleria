function Home() {
    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <section className="rounded-4xl bg-linear-to-r from-pink-600 via-rose-500 to-pink-400 p-10 text-white shadow-xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-pink-100">
                            Elegant. Beautiful. Yours.
                        </p>

                        <h1 className="text-5xl font-black leading-tight">
                            Find Your Perfect Gown
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-pink-50">
                            Discover stunning gowns curated for weddings, galas,
                            proms, and every unforgettable celebration.
                        </p>

                    </div>

                    <div className="rounded-4xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                        <div className="h-96 rounded-3xl bg-linear-to-br from-white/20 via-pink-200/20 to-rose-300/20" />
                    </div>
                </div>
            </section>

            <section className="mt-16">
                <div className="mb-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                        Why choose us
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        Beautiful choices for every occasion
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            title: "Curated Collection",
                            text: "Handpicked styles crafted for elegance and comfort.",
                        },
                        {
                            title: "Fast & Easy",
                            text: "Browse gowns, add to cart, and shop with confidence.",
                        },
                        {
                            title: "Trusted Quality",
                            text: "Premium quality dresses designed to make moments memorable.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                        >
                            <h3 className="text-xl font-bold text-gray-900">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-gray-600">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Home;
