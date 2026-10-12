const loginForm = document.getElementById("form-login") as HTMLFormElement | null;
const loginName = document.getElementById("login-name") as HTMLInputElement | null;
const loginRole = document.getElementById("login-role") as HTMLSelectElement | null;

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!loginName || !loginRole) return;

  const firstName = loginName.value.trim();
  const role = loginRole.value as Role;
  if (!firstName || !["admin", "moderator", "user"].includes(role)) return;

  saveSession({
    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    firstName,
    role,
  });

  window.location.href = role === "user" ? "operator.html" : "index.html";
});
