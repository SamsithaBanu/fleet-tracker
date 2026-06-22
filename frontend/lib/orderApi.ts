// orderApi.ts
import {
  AUTH_BASE,
  NOTIFICATION_BASE,
  ORDER_BASE,
  TRACKING_BASE,
  getAuthHeader,
  getAuthHeaderOnly,
} from "./config";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// ── Refresh the access token using the refresh token ──
const refreshAccessToken = async (): Promise<boolean> => {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) return false;

  try {
    const res = await fetch(`${AUTH_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const request = async (
  base: string,
  path: string,
  options: RequestInit = {},
  auth: boolean = true,
) => {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...(auth ? getAuthHeader() : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  // ── Token expired? Try refreshing once, then retry the request ──
  if (res.status === 401 && auth) {
    // Prevent multiple simultaneous refresh calls
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry original request with new token
      const retryRes = await fetch(`${base}${path}`, {
        ...options,
        headers: {
          ...getAuthHeader(),
          ...options.headers,
        },
      });
      return retryRes.json();
    } else {
      // Refresh failed — force logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return {
        success: false,
        message: "Session expired. Please login again.",
      };
    }
  }

  return res.json();
};

// ── rest of your file stays exactly the same ──
export const authApi = {
  login: (email: string, password: string) =>
    request(
      AUTH_BASE,
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false,
    ),
  register: (body: object) =>
    request(
      AUTH_BASE,
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),
  me: () => request(AUTH_BASE, "/auth/me"),
  logout: () => request(AUTH_BASE, "/auth/logout", { method: "POST" }),
  refreshToken: (refreshToken: string) =>
    request(
      AUTH_BASE,
      "/auth/refresh-token",
      { method: "POST", body: JSON.stringify({ refreshToken }) },
      false,
    ),
};

// ... keep all your other exports (wareHouseAPi, driverApi, orderApi, trackingApi, notificationApi) unchanged

export const wareHouseAPi = {
  getAll: () => request(ORDER_BASE, "/warehouses"),
  getOne: (id: string) => request(ORDER_BASE, `/warehouses/${id}`),
  seed: () => request(ORDER_BASE, "/warehouses/seed", { method: "POST" }),
};

// ── DRIVERS ───────────────────────────────────
export const driverApi = {
  getAll: (params = "") => request(ORDER_BASE, `/drivers${params}`),
  getOne: (id: string) => request(ORDER_BASE, `/drivers/${id}`),
  add: (body: object) =>
    request(ORDER_BASE, "/drivers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: object) =>
    request(ORDER_BASE, `/drivers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  toggleStatus: (body: object) =>
    request(ORDER_BASE, "/drivers/status", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getEarnings: (driverId: string) =>
    request(ORDER_BASE, `/drivers/${driverId}/earnings`),
};

// ── ORDERS ────────────────────────────────────
export const orderApi = {
  getAll: (params = "") => request(ORDER_BASE, `/orders${params}`),
  getOne: (id: string) => request(ORDER_BASE, `/orders/${id}`),
  create: (body: object) =>
    request(ORDER_BASE, "/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  track: (orderId: string) =>
    fetch(`${ORDER_BASE}/orders/track/${orderId}`).then((r) => r.json()),

  markPickedUp: (id: string) =>
    request(ORDER_BASE, `/orders/${id}/pickup`, { method: "PUT" }),

  markDelivered: async (id: string, file?: File | null) => {
    const formData = new FormData();
    if (file) formData.append("photo", file);
    const res = await fetch(`${ORDER_BASE}/orders/${id}/deliver`, {
      method: "PUT",
      headers: getAuthHeaderOnly(),
      body: formData,
    });
    return res.json();
  },

  markFailed: (id: string, reason: string) =>
    request(ORDER_BASE, `/orders/${id}/fail`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  getLive: () => request(ORDER_BASE, "/orders/live"),
  getAnalytics: () => request(ORDER_BASE, "/orders/analytics"),
};

// ── TRACKING ──────────────────────────────────
export const trackingApi = {
  getAll: () => request(TRACKING_BASE, "/tracking/all"),
  getOne: (driverId: string) =>
    request(TRACKING_BASE, `/tracking/location/${driverId}`),
  updateLocation: (body: object) =>
    request(TRACKING_BASE, "/tracking/location", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const notificationApi = {
  getAll: () => request(NOTIFICATION_BASE, "/notifications"),
  markRead: (id: string) =>
    request(NOTIFICATION_BASE, `/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    request(NOTIFICATION_BASE, "/notifications/read-all", { method: "PUT" }),
};
