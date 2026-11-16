const API_BASE = "/api";
const TOKEN_KEY = "animalcare_access_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Object.assign(new Error(payload.message || "Não foi possível concluir a operação."), {
      status: response.status,
      data: payload,
    });
    throw error;
  }
  return payload;
}

const auth = {
  async isAuthenticated() {
    try {
      await auth.me();
      return true;
    } catch {
      return false;
    }
  },
  me: () => request("/auth/me"),
  loginViaEmailPassword: async (email, password) => {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    auth.setToken(result.access_token);
    return result;
  },
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  verifyOtp: async (data) => {
    const result = await request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) });
    if (result.access_token) auth.setToken(result.access_token);
    return result;
  },
  resendOtp: (email) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  resetPasswordRequest: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: ({ resetToken, newPassword }) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token: resetToken, newPassword }) }),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  logout: () => localStorage.removeItem(TOKEN_KEY),
  redirectToLogin: (returnTo = "/") => {
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  },
  loginWithProvider: () => {
    throw new Error("Login com Google não está configurado neste ambiente.");
  },
};

function createEntityApi(name) {
  if (name === "User") {
    return {
      list: (sort, limit) => {
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);
        if (limit) params.set("limit", limit);
        return request(`/users?${params}`);
      },
      get: (id) => request(`/users/${encodeURIComponent(id)}`),
      create: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
      update: (id, data) => request(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
      delete: (id) => request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" }),
    };
  }
  const encoded = encodeURIComponent(name);
  return {
    list: (sort, limit) => {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (limit) params.set("limit", limit);
      return request(`/entities/${encoded}?${params}`);
    },
    filter: (filters = {}, sort, limit) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => params.set(key, String(value)));
      if (sort) params.set("sort", sort);
      if (limit) params.set("limit", limit);
      return request(`/entities/${encoded}?${params}`);
    },
    get: (id) => request(`/entities/${encoded}/${encodeURIComponent(id)}`),
    create: (data) => request(`/entities/${encoded}`, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/entities/${encoded}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`/entities/${encoded}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}

const entities = /** @type {any} */ (new Proxy({}, { get: (_, name) => createEntityApi(name) }));

const functions = {
  invoke: (name, payload = {}) => {
    if (!name || typeof name !== "string") {
      return Promise.reject(new TypeError("Informe o nome da função a ser executada."));
    }
    return request(`/functions/${encodeURIComponent(name)}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const db = {
  auth,
  entities,
  functions,
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = getToken();
        const response = await fetch(`${API_BASE}/uploads`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Não foi possível enviar a imagem.");
        return payload;
      },
    },
  },
};

export const base44 = db;
export default db;
