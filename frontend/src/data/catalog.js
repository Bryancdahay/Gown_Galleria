export const CART_KEY = "gownGalleriaCart";
export const ORDERS_KEY = "gownGalleriaOrders";
export const PRODUCTS_KEY = "gownGalleriaProducts";
export const USERS_KEY = "gownGalleriaUsers";
export const AUDIT_KEY = "gownGalleriaAudit";
export const CATEGORIES_KEY = "gownGalleriaCategories";
export const SHOPS_KEY = "gownGalleriaShops";
export const MESSAGES_KEY = "gownGalleriaMessages";
export const RESET_KEY = "gownGalleriaFreshReset20260919";

const defaultUsers = [
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
    } catch {
        return [];
    }
}

export function ensureSeededStorage() {
    if (typeof window === "undefined") {
        return;
    }

    if (!localStorage.getItem(SHOPS_KEY)) {
        localStorage.setItem(SHOPS_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(RESET_KEY)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify([]));
        localStorage.setItem(SHOPS_KEY, JSON.stringify([]));
        localStorage.setItem(AUDIT_KEY, JSON.stringify([]));
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser?.email !== "superadmin@gowngalleria.com") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        localStorage.setItem(RESET_KEY, "complete");
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
            product.category === existingCategory.title &&
            (!existingCategory.shopId || product.shopId === existingCategory.shopId)
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
            product.category === categoryToDelete.title &&
            (!categoryToDelete.shopId || product.shopId === categoryToDelete.shopId)
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

export function getCurrentShop() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!currentUser || currentUser.role !== "shop-admin") {
        return null;
    }

    return getShops().find((shop) => shop.adminUserId === currentUser.id) || null;
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

export function getMessages() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(MESSAGES_KEY));
}

export function addMessage(message) {
    const messages = [...getMessages(), {
        id: `message-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        ...message,
    }];

    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event("messages:updated"));
    return messages;
}

export function getAuditTrail(role, shopId) {
    ensureSeededStorage();
    const auditTrail = safeJSONParse(localStorage.getItem(AUDIT_KEY));

    if (!role && !shopId) {
        return auditTrail;
    }

    return auditTrail.filter(
        (entry) =>
            (!role || entry.role === role) &&
            (!shopId || entry.shopId === shopId)
    );
}

export function addAuditEntry(action, details, roleOverride) {
    const auditTrail = getAuditTrail();
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const entryRole = roleOverride || storedUser?.role || "customer";
    const currentShop = getShops().find(
        (shop) => shop.adminUserId === storedUser?.id
    );
    const entry = {
        id: `${Date.now()}-${Math.random()}`,
        action,
        details,
        createdAt: new Date().toISOString(),
        role: entryRole,
        shopId: currentShop?.id || null,
    };

    const updatedTrail = [entry, ...auditTrail];
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updatedTrail));

    return updatedTrail;
}

