// const API_URL = 'http://127.0.0.1:3005/auth';

// export async function login(email: string, password: string) {
//     const response = await fetch(`${API_URL}/login`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//     }

//     // Store tokens
//     if (data.data?.accessToken) {
//         localStorage.setItem('accessToken', data.data.accessToken);
//     }
//     if (data.data?.refreshToken) {
//         localStorage.setItem('refreshToken', data.data.refreshToken);
//     }
//     if (data.data?.user) {
//         localStorage.setItem('user', JSON.stringify(data.data.user));
//     }

//     return data;
// }

// export async function register(userData: any) {
//     const response = await fetch(`${API_URL}/register`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(data.message || 'Registration failed');
//     }

//     return data;
// }

// export async function refreshAccessToken() {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (!refreshToken) {
//         logout();
//         throw new Error('No refresh token available');
//     }

//     try {
//         const response = await fetch(`${API_URL}/refresh-token`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ refreshToken }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.message || 'Refresh failed');
//         }

//         if (data.data?.accessToken) {
//             localStorage.setItem('accessToken', data.data.accessToken);
//         }
//         if (data.data?.refreshToken) {
//             localStorage.setItem('refreshToken', data.data.refreshToken);
//         }

//         return data.data;
//     } catch (error) {
//         logout();
//         throw error;
//     }
// }

// export function logout() {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     if (typeof window !== 'undefined') {
//         window.location.href = '/login';
//     }
// }

// // Wrapper for authenticated requests
// export async function apiFetch(endpoint: string, options: any = {}) {
//     let accessToken = localStorage.getItem('accessToken');

//     const headers = {
//         'Content-Type': 'application/json',
//         ...options.headers,
//     };

//     if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//     }

//     let response = await fetch(`${API_URL}${endpoint}`, {
//         ...options,
//         headers,
//     });

//     // If token expired (401), try to refresh once
//     if (response.status === 401) {
//         try {
//             const data = await refreshAccessToken();
//             accessToken = data.accessToken;

//             // Retry original request with new token
//             headers['Authorization'] = `Bearer ${accessToken}`;
//             response = await fetch(`${API_URL}${endpoint}`, {
//                 ...options,
//                 headers,
//             });
//         } catch (error) {
//             // Refresh failed, logout already handled inside refreshAccessToken
//             throw error;
//         }
//     }

//     const data = await response.json();
//     if (!response.ok) {
//         throw new Error(data.message || 'Request failed');
//     }

//     return data;
// }
