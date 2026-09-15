const defaultProducts = [];

const defaultCategories = [];

export const CART_KEY = "gownGalleriaCart";
export const ORDERS_KEY = "gownGalleriaOrders";
export const PRODUCTS_KEY = "gownGalleriaProducts";
export const USERS_KEY = "gownGalleriaUsers";
export const AUDIT_KEY = "gownGalleriaAudit";
export const CATEGORIES_KEY = "gownGalleriaCategories";
export const SHOPS_KEY = "gownGalleriaShops";

const defaultUsers = [
    {
        id: "customer-demo",
        name: "Customer User",
        email: "customer@gowngalleria.com",
        password: "customer123",
        role: "customer",
    },
    {
        id: "shop-admin-demo",
        name: "Shop Admin",
        email: "shopadmin@gowngalleria.com",
        password: "admin123",
        role: "shop-admin",
    },
    {
        id: "super-admin-demo",
        name: "Super Admin",
        email: "superadmin@gowngalleria.com",
        password: "superadmin123",
        role: "super-admin",
    },
];

function safeJSONParse(value) {
    try {
        return value ? JSON.parse(value) : [];
    } catch (error) {
        return [];
    }
}

export function ensureSeededStorage() {
    if (typeof window === "undefined") {
        return;
    }

    if (!localStorage.getItem(PRODUCTS_KEY)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem(CATEGORIES_KEY)) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    }

    if (!localStorage.getItem(SHOPS_KEY)) {
        localStorage.setItem(SHOPS_KEY, JSON.stringify([]));
    }

    const storedUsers = safeJSONParse(localStorage.getItem(USERS_KEY));
    const normalizedUsers = Array.isArray(storedUsers) ? storedUsers : [];
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    const missingUsers = defaultUsers.filter(
        (defaultUser) =>
            !normalizedUsers.some(
                (existingUser) =>
                    existingUser.email.toLowerCase() === defaultUser.email.toLowerCase()
            )
    );

    const loggedInUserMissing =
        storedUser &&
        !normalizedUsers.some(
            (existingUser) =>
                existingUser.email.toLowerCase() === storedUser.email.toLowerCase()
        );

    const mergedUsers = [...normalizedUsers, ...missingUsers];

    if (loggedInUserMissing && storedUser) {
        mergedUsers.push(storedUser);
    }

    if (mergedUsers.length !== normalizedUsers.length || missingUsers.length > 0 || loggedInUserMissing) {
        localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
    }

    if (!localStorage.getItem(AUDIT_KEY)) {
        localStorage.setItem(
            AUDIT_KEY,
            JSON.stringify([
                {
                    id: "seed-entry",
                    action: "System initialized",
                    details: "Demo accounts and catalog were seeded.",
                    createdAt: new Date().toISOString(),
                },
            ])
        );
    }
}

export function getProducts() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(PRODUCTS_KEY));
}

export function getCategories() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(CATEGORIES_KEY));
}

export function saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
}

export function upsertCategory(category) {
    const currentCategories = getCategories();
    const existingCategory = currentCategories.find((item) => item.id === category.id);

    const nextCategories = existingCategory
        ? currentCategories.map((item) =>
              item.id === category.id ? { ...item, ...category } : item
          )
        : [...currentCategories, category];

    if (existingCategory && existingCategory.title !== category.title) {
        const currentProducts = getProducts();
        const updatedProducts = currentProducts.map((product) =>
            product.category === existingCategory.title
                ? { ...product, category: category.title }
                : product
        );

        saveProducts(updatedProducts);
    }

    saveCategories(nextCategories);

    return nextCategories;
}

export function deleteCategory(categoryId) {
    const currentCategories = getCategories();
    const categoryToDelete = currentCategories.find((item) => item.id === categoryId);
    const nextCategories = currentCategories.filter((item) => item.id !== categoryId);

    if (categoryToDelete) {
        const currentProducts = getProducts();
        const updatedProducts = currentProducts.map((product) =>
            product.category === categoryToDelete.title
                ? { ...product, category: "Uncategorized" }
                : product
        );

        saveProducts(updatedProducts);
    }

    saveCategories(nextCategories);

    return nextCategories;
}

export function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return products;
}

export function upsertProduct(product) {
    const currentProducts = getProducts();
    const productExists = currentProducts.some((item) => item.id === product.id);

    const updatedProducts = productExists
        ? currentProducts.map((item) =>
              item.id === product.id ? { ...item, ...product } : item
          )
        : [...currentProducts, product];

    saveProducts(updatedProducts);

    return updatedProducts;
}

export function deleteProduct(productId) {
    const updatedProducts = getProducts().filter((item) => item.id !== productId);
    saveProducts(updatedProducts);
    return updatedProducts;
}

export function getUsers() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(USERS_KEY));
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
}

export function getShops() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(SHOPS_KEY));
}

export function saveShops(shops) {
    localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
    return shops;
}

export function createUser(userData) {
    const currentUsers = getUsers();
    const existingUser = currentUsers.find(
        (user) => user.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existingUser) {
        return existingUser;
    }

    const newUser = {
        id: userData.id || `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "customer",
    };

    const updatedUsers = [...currentUsers, newUser];
    saveUsers(updatedUsers);

    return newUser;
}

export function deleteUser(userId) {
    const updatedUsers = getUsers().filter((user) => user.id !== userId);
    saveUsers(updatedUsers);
    return updatedUsers;
}

export function getStoredCart() {
    return safeJSONParse(localStorage.getItem(CART_KEY));
}

export function setStoredCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function getStoredOrders() {
    return safeJSONParse(localStorage.getItem(ORDERS_KEY));
}

export function setStoredOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getAuditTrail(role) {
    ensureSeededStorage();
    const auditTrail = safeJSONParse(localStorage.getItem(AUDIT_KEY));

    if (!role) {
        return auditTrail;
    }

    return auditTrail.filter((entry) => entry.role === role);
}

export function addAuditEntry(action, details, roleOverride) {
    const auditTrail = getAuditTrail();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const entryRole = roleOverride || storedUser?.role || "customer";
    const entry = {
        id: `${Date.now()}-${Math.random()}`,
        action,
        details,
        createdAt: new Date().toISOString(),
        role: entryRole,
    };

    const updatedTrail = [entry, ...auditTrail];
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updatedTrail));

    return updatedTrail;
}

export function getCategoryCollections(slug) {
    const category = getCategories().find((item) => item.slug === slug);

    if (!category) {
        return [];
    }

    return getProducts().filter((item) => item.category === category.title);
}

export const gowns = defaultProducts;
