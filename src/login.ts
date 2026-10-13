(() => {
  const API_BASE = "https://dummyjson.com";

  const form = document.getElementById("form-login") as HTMLFormElement | null;
  const usernameInput = document.getElementById("login-username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("login-password") as HTMLInputElement | null;
  const submitBtn = document.getElementById("btn-login") as HTMLButtonElement | null;
  const errorBox = document.getElementById("login-error") as HTMLElement | null;

  // Bentuk respons dari dummyjson
  interface LoginResponse {
    id?: number;
    firstName?: string;
    accessToken?: string;
    token?: string;
    role?: string;
    message?: string;
  }

  interface UserProfile {
    role?: string;
  }

  // Sudah login? langsung arahkan ke halaman sesuai role
  const existing = getSession();
  if (existing) {
    window.location.replace(homeFor(existing.role));
    return;
  }

  function showError(message: string): void {
    if (errorBox) errorBox.textContent = message;
  }

  function setLoading(loading: boolean): void {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Memproses..." : "Masuk";
  }

  function isRole(value: unknown): value is Role {
    return typeof value === "string" && VALID_ROLES.includes(value as Role);
  }

  // Respons /auth/login tidak selalu berisi role, jadi ambil dari /auth/me
  // (atau /users/:id sebagai cadangan)
  async function resolveRole(data: LoginResponse, token: string): Promise<string | undefined> {
    if (data.role) return data.role;

    const me = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (me.ok) {
      const profile = (await me.json()) as UserProfile;
      if (profile.role) return profile.role;
    }

    if (data.id !== undefined) {
      const res = await fetch(`${API_BASE}/users/${data.id}`);
      if (res.ok) return ((await res.json()) as UserProfile).role;
    }
    return undefined;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!usernameInput || !passwordInput) return;

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
      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        showError(
          response.status === 400
            ? "Username atau password salah."
            : data.message ?? "Login gagal. Coba lagi."
        );
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
    } catch (err) {
      console.error("Login error:", err);
      showError("Koneksi jaringan gagal. Periksa internet Anda lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  });
})();
