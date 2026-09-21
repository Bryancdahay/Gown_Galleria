export const CART_KEY = "gownGalleriaCart";
export const ORDERS_KEY = "gownGalleriaOrders";
export const PRODUCTS_KEY = "gownGalleriaProducts";
export const USERS_KEY = "gownGalleriaUsers";
export const AUDIT_KEY = "gownGalleriaAudit";
export const CATEGORIES_KEY = "gownGalleriaCategories";
export const SHOPS_KEY = "gownGalleriaShops";
export const MESSAGES_KEY = "gownGalleriaMessages";
export const RESET_KEY = "gownGalleriaFreshReset20260919";
export const LAST_CART_OWNER_KEY = "gownGalleriaLastCartOwner";
export const SHOP_APPLICATIONS_KEY = "gownGalleriaShopApplications";
export const NOTIFICATIONS_KEY = "gownGalleriaNotifications";

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

    if (!localStorage.getItem(SHOP_APPLICATIONS_KEY)) {
        localStorage.setItem(SHOP_APPLICATIONS_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
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
        const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
        if (storedUser?.email !== "superadmin@gowngalleria.com") {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
        }
        localStorage.setItem(RESET_KEY, "complete");
    }

    const storedUsers = safeJSONParse(localStorage.getItem(USERS_KEY));
    const normalizedUsers = Array.isArray(storedUsers) ? storedUsers : [];
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

    let storageNeedsUpdate = false;
    const missingUsers = defaultUsers.filter(
        (defaultUser) =>
            !normalizedUsers.some(
                (existingUser) =>
                    existingUser.email.toLowerCase() === defaultUser.email.toLowerCase()
            )
    );

    const mergedUsers = [...normalizedUsers];

    if (missingUsers.length > 0) {
        mergedUsers.push(...missingUsers);
        storageNeedsUpdate = true;
    }

    if (storedUser) {
        const index = mergedUsers.findIndex(
            (existingUser) =>
                existingUser.id === storedUser.id ||
                existingUser.email?.toLowerCase() === storedUser.email?.toLowerCase()
        );

        if (index === -1) {
            mergedUsers.push(storedUser);
            storageNeedsUpdate = true;
        } else if (storedUser.avatar && mergedUsers[index].avatar !== storedUser.avatar) {
            mergedUsers[index] = {
                ...mergedUsers[index],
                avatar: storedUser.avatar,
            };
            storageNeedsUpdate = true;
        }
    }

    if (storageNeedsUpdate) {
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
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");

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

// True when there is no active session, or the active session's account still exists.
export function isSessionValid() {
    if (typeof window === "undefined") {
        return true;
    }

    const token = sessionStorage.getItem("token");
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !storedUser) {
        return true;
    }

    const users = getUsers();

    return users.some(
        (user) =>
            user.id === storedUser.id ||
            (storedUser.email && user.email?.toLowerCase() === storedUser.email.toLowerCase())
    );
}

export function clearSession() {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("user:updated"));
}

export function getCartUserKey(userId) {
    if (userId) return `gownGalleriaCart_${userId}`;
    if (typeof window === "undefined") return "gownGalleriaCart_guest";
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const lastOwner = localStorage.getItem(LAST_CART_OWNER_KEY);
    const userIdentifier = storedUser?.id || storedUser?.email || lastOwner || "guest";
    return `gownGalleriaCart_${userIdentifier}`;
}

// Remembers the last logged-in cart owner so items stay visible after logout.
export function rememberCartOwner(identifier) {
    if (typeof window === "undefined" || !identifier) {
        return;
    }

    localStorage.setItem(LAST_CART_OWNER_KEY, identifier);
}

export function getStoredCart(userId) {
    const key = getCartUserKey(userId);
    let cartData = localStorage.getItem(key);

    if (cartData === null && key !== CART_KEY) {
        const legacyCart = localStorage.getItem(CART_KEY);
        if (legacyCart) {
            localStorage.setItem(key, legacyCart);
            localStorage.removeItem(CART_KEY);
            cartData = legacyCart;
        }
    }

    return safeJSONParse(cartData);
}

export function setStoredCart(cart, userId) {
    const key = getCartUserKey(userId);
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));
}

export function getReservationCartUserKey(userId) {
    if (userId) return `gownGalleriaReservationCart_${userId}`;
    if (typeof window === "undefined") return "gownGalleriaReservationCart_guest";
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const lastOwner = localStorage.getItem(LAST_CART_OWNER_KEY);
    const userIdentifier = storedUser?.id || storedUser?.email || lastOwner || "guest";
    return `gownGalleriaReservationCart_${userIdentifier}`;
}

export function getStoredReservationCart(userId) {
    const key = getReservationCartUserKey(userId);
    return safeJSONParse(localStorage.getItem(key));
}

export function setStoredReservationCart(cart, userId) {
    const key = getReservationCartUserKey(userId);
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event("reservation-cart:updated"));
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
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
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
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("audit:updated"));
    }

    return updatedTrail;
}

export function getShopApplications() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(SHOP_APPLICATIONS_KEY));
}

export function saveShopApplications(applications) {
    localStorage.setItem(SHOP_APPLICATIONS_KEY, JSON.stringify(applications));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shop-applications:updated"));
    }
    return applications;
}

export function getNotifications() {
    ensureSeededStorage();
    return safeJSONParse(localStorage.getItem(NOTIFICATIONS_KEY));
}

export function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications:updated"));
    }
    return notifications;
}

export function addNotification({ targetUserId, targetRole, type, message, applicationId }) {
    const notifications = getNotifications();
    const notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        targetUserId: targetUserId || null,
        targetRole: targetRole || null,
        type,
        message,
        applicationId: applicationId || null,
        read: false,
        createdAt: new Date().toISOString(),
    };

    return saveNotifications([notification, ...notifications]);
}

export function getNotificationsForUser(user) {
    if (!user) {
        return [];
    }

    return getNotifications().filter(
        (notification) =>
            notification.targetUserId === user.id ||
            (notification.targetRole && notification.targetRole === user.role)
    );
}

export function markNotificationRead(notificationId) {
    const notifications = getNotifications();
    const updated = notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
    );
    return saveNotifications(updated);
}

export function markAllNotificationsRead(user) {
    if (!user) {
        return getNotifications();
    }

    const notifications = getNotifications();
    const updated = notifications.map((notification) =>
        notification.targetUserId === user.id ||
        (notification.targetRole && notification.targetRole === user.role)
            ? { ...notification, read: true }
            : notification
    );
    return saveNotifications(updated);
}

export function createShopApplication(data, customer) {
    const applications = getShopApplications();
    const application = {
        id: `shop-app-${Date.now()}`,
        customerId: customer.id,
        customerEmail: customer.email,
        shopName: data.shopName,
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        phone: data.phone,
        address: data.address,
        password: data.password,
        status: "pending",
        converted: false,
        createdAt: new Date().toISOString(),
        decidedAt: null,
    };

    saveShopApplications([application, ...applications]);

    addNotification({
        targetRole: "super-admin",
        type: "shop-application-new",
        message: `${data.ownerName} applied to become a shop owner (${data.shopName}).`,
        applicationId: application.id,
    });

    return application;
}

export function approveShopApplication(applicationId) {
    const applications = getShopApplications();
    const application = applications.find((app) => app.id === applicationId);

    if (!application) {
        return null;
    }

    const updated = applications.map((app) =>
        app.id === applicationId
            ? { ...app, status: "approved", decidedAt: new Date().toISOString() }
            : app
    );
    saveShopApplications(updated);

    addNotification({
        targetUserId: application.customerId,
        type: "shop-application-approved",
        message: `Your application for "${application.shopName}" was approved! Click "Be a shop owner" to activate your shop account.`,
        applicationId,
    });

    addAuditEntry(
        "Approved shop application",
        `${application.ownerName}'s application for "${application.shopName}" was approved.`,
        "super-admin"
    );

    return application;
}

export function declineShopApplication(applicationId) {
    const applications = getShopApplications();
    const application = applications.find((app) => app.id === applicationId);

    if (!application) {
        return null;
    }

    const updated = applications.map((app) =>
        app.id === applicationId
            ? { ...app, status: "declined", decidedAt: new Date().toISOString() }
            : app
    );
    saveShopApplications(updated);

    addNotification({
        targetUserId: application.customerId,
        type: "shop-application-declined",
        message: `Your application for "${application.shopName}" was declined.`,
        applicationId,
    });

    addAuditEntry(
        "Declined shop application",
        `${application.ownerName}'s application for "${application.shopName}" was declined.`,
        "super-admin"
    );

    return application;
}

// Converts the applicant's own customer account into a shop-admin account using the application's details.
export function convertToShopOwner(applicationId) {
    const applications = getShopApplications();
    const application = applications.find((app) => app.id === applicationId);

    if (!application || application.status !== "approved" || application.converted) {
        return null;
    }

    const users = getUsers();
    const targetUser = users.find((user) => user.id === application.customerId);

    if (!targetUser) {
        return null;
    }

    const updatedUser = {
        ...targetUser,
        name: application.ownerName,
        email: application.ownerEmail,
        phone: application.phone,
        address: application.address,
        password: application.password,
        role: "shop-admin",
    };

    const updatedUsers = users.map((user) =>
        user.id === targetUser.id ? updatedUser : user
    );
    saveUsers(updatedUsers);

    const newShop = {
        id: `shop-${Date.now()}`,
        name: application.shopName,
        owner: application.ownerName,
        email: application.ownerEmail,
        phone: application.phone,
        address: application.address,
        adminUserId: targetUser.id,
        avatar: targetUser.avatar || "",
    };
    saveShops([...getShops(), newShop]);

    const updatedApplications = applications.map((app) =>
        app.id === applicationId ? { ...app, converted: true } : app
    );
    saveShopApplications(updatedApplications);

    addNotification({
        targetUserId: targetUser.id,
        type: "shop-live",
        message: `Congratulations! "${application.shopName}" is now live.`,
        applicationId,
    });

    return updatedUser;
}

