"use strict";
(() => {
    const API_BASE = "https://dummyjson.com";
    const form = document.getElementById("form-login");
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("btn-login");
    const errorBox = document.getElementById("login-error");

    const existing = getSession();
    if (existing) {
        window.location.replace(homeFor(existing.role));
        return;
    }
    function showError(message) {
        if (errorBox)
            errorBox.textContent = message;
    }
    function setLoading(loading) {
        if (!submitBtn)
            return;
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? "Memproses..." : "Masuk";
    }
    function isRole(value) {
        return typeof value === "string" && VALID_ROLES.includes(value);
    }

    async function resolveRole(data, token) {
        if (data.role)
            return data.role;
        const me = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (me.ok) {
            const profile = (await me.json());
            if (profile.role)
                return profile.role;
        }
        if (data.id !== undefined) {
            const res = await fetch(`${API_BASE}/users/${data.id}`);
            if (res.ok)
                return (await res.json()).role;
        }
        return undefined;
    }
    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!usernameInput || !passwordInput)
            return;
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (!username || !password) {
            showError("Username dan password wajib diisi.");
            return;
        }
        showError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, expiresInMins: 60 }),
            });
            const data = (await response.json());
            if (!response.ok) {
                showError(response.status === 400
                    ? "Username atau password salah."
                    : data.message ?? "Login gagal. Coba lagi.");
                return;
            }
            const token = data.accessToken ?? data.token;
            if (!token) {
                showError("Respons server tidak berisi token.");
                return;
            }
            const role = await resolveRole(data, token);
            if (!isRole(role)) {
                showError("Role akun tidak dikenali (harus admin, moderator, atau user).");
                return;
            }
            saveSession({ token, role, firstName: data.firstName ?? username });
            window.location.href = homeFor(role);
        }
        catch (err) {
            console.error("Login error:", err);
            showError("Koneksi jaringan gagal. Periksa internet Anda lalu coba lagi.");
        }
        finally {
            setLoading(false);
        }
    });
})();
