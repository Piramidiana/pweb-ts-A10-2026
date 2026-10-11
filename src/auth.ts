

const VALID_ROLES: Role[] = ["admin", "moderator", "user"];

function getSession(): Session | null {
  const s = readJSON<Session | null>(STORAGE_KEYS.session, null);
  if (
    !s ||
    typeof s.token !== "string" ||
    typeof s.firstName !== "string" ||
    !VALID_ROLES.includes(s.role)
  ) {
    return null;
  }
  return s;
}

function saveSession(session: Session): void {
  writeJSON(STORAGE_KEYS.session, session);
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function isAdminLike(role: Role): boolean {
  return role === "admin" || role === "moderator";
}

function requireAuth(options: { adminOnly?: boolean } = {}): Session | null {
  const session = getSession();
  if (!session || (options.adminOnly === true && !isAdminLike(session.role))) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

function logout(): void {
  clearSession();
  window.location.href = "login.html";
}
