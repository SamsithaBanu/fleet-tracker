// config.ts
// frontend/lib/config.ts
export const AUTH_BASE =
  process.env.NEXT_PUBLIC_AUTH_BASE || 'http://localhost:3001/api'

export const ORDER_BASE =
  process.env.NEXT_PUBLIC_ORDER_BASE || 'http://localhost:3012'

export const TRACKING_BASE =
  process.env.NEXT_PUBLIC_TRACKING_BASE || 'http://localhost:3003'

export const NOTIFICATION_BASE =
  process.env.NEXT_PUBLIC_NOTIFICATION_BASE || 'http://localhost:3004'

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_TRACKING_BASE ||
  'http://localhost:3003'
  
export const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const getAuthHeaderOnly = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};