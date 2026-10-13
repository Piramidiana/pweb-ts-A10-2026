"use strict";
const VALID_ROLES = ["admin", "moderator", "user"];
function getSession() {
    const s = readJSON(STORAGE_KEYS.session, null);
    if (!s ||
        typeof s.token !== "string" ||
        typeof s.firstName !== "string" ||
        !VALID_ROLES.includes(s.role)) {
        return null;
    }
    return s;
}
function saveSession(session) {
    writeJSON(STORAGE_KEYS.session, session);
}
function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
}
function isAdminLike(role) {
    return role === "admin" || role === "moderator";
}
function requireAuth(options = {}) {
    const session = getSession();
    if (!session || (options.adminOnly === true && !isAdminLike(session.role))) {
        window.location.href = "login.html";
        return null;
    }
    return session;
}
function logout() {
    clearSession();
    window.location.href = "login.html";
}

function homeFor(role) {
    return isAdminLike(role) ? "index.html" : "ambil-antrian.html";
}

function applyRoleVisibility(session) {
    const admin = isAdminLike(session.role);
    document.querySelectorAll("[data-admin-only]").forEach((node) => {
        node.style.display = admin ? "" : "none";
    });
}

function initSessionUI(session) {
    const userEl = document.getElementById("user-info");
    if (userEl)
        userEl.textContent = `${session.firstName} (${session.role})`;
    document.getElementById("btn-logout")?.addEventListener("click", logout);
    applyRoleVisibility(session);
}
