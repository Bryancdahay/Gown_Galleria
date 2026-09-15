import { ensureSeededStorage, getUsers, saveUsers } from "./data/catalog";

const API_URL = "http://127.0.0.1:8000/api";

export async function testApi() {
    const response = await fetch(`${API_URL}/test`);

    if (!response.ok) {
        throw new Error("API request failed");
    }

    return response.json();
}

export async function registerUser(userData) {
    ensureSeededStorage();

    const localUsers = getUsers();
    const trimmedEmail = (userData.email || "").trim().toLowerCase();
    const emailExists = localUsers.some(
        (user) => user.email.toLowerCase() === trimmedEmail
    );

    if (emailExists) {
        throw new Error("Email is already taken.");
    }

    const newUser = {
        id: `user-${Date.now()}`,
        name: (userData.name || "").trim(),
        email: trimmedEmail,
        password: userData.password,
        role: "customer",
    };

    saveUsers([...localUsers, newUser]);

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        return data;
    } catch (error) {
        return {
            success: true,
            message: "Account created locally.",
            user: newUser,
        };
    }
}

export async function loginUser(credentials) {
    ensureSeededStorage();

    const localUsers = getUsers();
    const matchingUser = localUsers.find(
        (user) =>
            user.email.toLowerCase() === credentials.email.toLowerCase() &&
            user.password === credentials.password
    );

    if (matchingUser) {
        return {
            success: true,
            message: "Login successful!",
            user: matchingUser,
            token: `local-${matchingUser.id}`,
        };
    }

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (token.startsWith("local-")) {
        return storedUser || null;
    }

    const response = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        return storedUser || null;
    }

    const data = await response.json();

    return data.user || storedUser || null;
}

export async function logoutUser() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Logout failed");
    }

    return data;
}
