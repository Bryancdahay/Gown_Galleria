function CustomerHome() {
    return (
        <main className="mx-auto max-w-7xl px-6 py-16">
            <section className="rounded-[2rem] bg-gradient-to-r from-gray-900 via-pink-700 to-pink-500 p-10 text-white shadow-xl">
                <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-pink-100">
                            Welcome back
                        </p>
                        <h1 className="mt-3 text-4xl font-black">
                            Your gown journey starts here
                        </h1>
                        <p className="mt-4 max-w-xl text-lg text-pink-50">
                            Explore our curated collection, discover your favorite
                            style, and shop the dresses that fit your moment.
                        </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
                        <div className="h-72 rounded-[1.2rem] bg-gradient-to-br from-pink-200/60 via-white/20 to-rose-300/40" />
                    </div>
                </div>
            </section>

        </main>
    );
}

export default CustomerHome;
