// config.ts
export const AUTH_BASE = "http://localhost:3001/api";
export const ORDER_BASE = "http://localhost:3012";
export const TRACKING_BASE = "http://localhost:3003";
export const NOTIFICATION_BASE = "http://localhost:3004";

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