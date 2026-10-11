"use strict";
// ============================================================
// SESI LOGIN & GUARD HALAMAN
// Pemilik: Piramidiana.
// Dipakai: login.ts (saveSession), dashboard.ts & operator.ts (requireAuth, logout)
// ============================================================
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
// Aturan PDF: moderator diperlakukan sama dengan admin
function isAdminLike(role) {
    return role === "admin" || role === "moderator";
}
// Taruh di baris pertama halaman yang butuh login.
//   Dashboard : const session = requireAuth({ adminOnly: true });
//   Operator  : const session = requireAuth();
// Kalau gagal -> redirect ke login.html dan return null (hentikan script halaman).
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
