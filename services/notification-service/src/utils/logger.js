const logger = {
  info: (msg, data = "") => {
    console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`, data);
  },
  success: (msg, data = '') => {
    console.log(`[${new Date().toISOString()}] ✅ ${msg}`, data)
  },
  error: (msg, data = '') => {
    console.error(`[${new Date().toISOString()}] ❌ ${msg}`, data)
  },
  warn: (msg, data = '') => {
    console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`, data)
  },
};

export default logger;
