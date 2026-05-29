import { authHeader, ORDER_API } from "@/constants/constants"

export const orderApi = {
    getWarehouses: async () => {
        const res = await fetch(`${ORDER_API}/warehouses`, { headers: authHeader() })
        return res.json()
    },
    getWarehouse: async (id: string) => {
        const res = await fetch(`${ORDER_API}/warehouses/${id}`, { headers: authHeader() })
        return res.json()
    },
    getDrivers: async (params = '') => {
        const res = await fetch(`${ORDER_API}/drivers${params}`, { headers: authHeader() })
        return res.json()
    },
    addDriver: async (body: object) => {
        const res = await fetch(`${ORDER_API}/drivers`, {
            method: 'POST', headers: authHeader(), body: JSON.stringify(body),
        })
        return res.json()
    },
    getDriver: async (id: string) => {
        const res = await fetch(`${ORDER_API}/drivers/${id}`, { headers: authHeader() })
        return res.json()
    },
    getDriverEarnings: async (driverId: string) => {
        const res = await fetch(`${ORDER_API}/drivers/${driverId}/earnings`, { headers: authHeader() })
        return res.json()
    },
    toggleDriverStatus: async (body: object) => {
        const res = await fetch(`${ORDER_API}/drivers/status`, {
            method: 'PUT', headers: authHeader(), body: JSON.stringify(body),
        })
        return res.json()
    },
    getOrders: async (params = '') => {
        const res = await fetch(`${ORDER_API}/orders${params}`, { headers: authHeader() })
        return res.json()
    },
    getOrder: async (id: string) => {
        const res = await fetch(`${ORDER_API}/orders/${id}`, { headers: authHeader() })
        return res.json()
    },
    createOrder: async (body: object) => {
        const res = await fetch(`${ORDER_API}/orders`, {
            method: 'POST', headers: authHeader(), body: JSON.stringify(body),
        })
        return res.json()
    },
    trackOrder: async (orderId: string) => {
        const res = await fetch(`${ORDER_API}/orders/track/${orderId}`)
        return res.json()
    },
    markPickedUp: async (id: string) => {
        const res = await fetch(`${ORDER_API}/orders/${id}/pickup`, {
            method: 'PUT', headers: authHeader(),
        })
        return res.json()
    },
    markDelivered: async (id: string, formData: FormData) => {
        const res = await fetch(`${ORDER_API}/orders/${id}/deliver`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            body: formData,
        })
        return res.json()
    },
    markFailed: async (id: string, reason: string) => {
        const res = await fetch(`${ORDER_API}/orders/${id}/fail`, {
            method: 'PUT', headers: authHeader(), body: JSON.stringify({ reason }),
        })
        return res.json()
    },
    getLiveOrders: async () => {
        const res = await fetch(`${ORDER_API}/orders/live`, { headers: authHeader() })
        return res.json()
    },
    getAnalytics: async () => {
        const res = await fetch(`${ORDER_API}/orders/analytics`, { headers: authHeader() })
        return res.json()
    },
}