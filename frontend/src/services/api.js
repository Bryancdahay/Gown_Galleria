const API_URL = "http://127.0.0.1:8000/api";

export async function registerUser(userData) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

export async function loginUser(credentials) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    // Save authentication information
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    const response = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return null;
    }

    const data = await response.json();

    return data.user;
}

export async function logoutUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Logout failed");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return data;
}

export async function testApi() {
    const response = await fetch(`${API_URL}/test`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("API request failed");
    }

    return response.json();
}
