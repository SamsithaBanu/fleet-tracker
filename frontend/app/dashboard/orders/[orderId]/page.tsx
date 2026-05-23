// frontend/app/track/[orderId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import — Leaflet cannot run on server
const CustomerMap = dynamic(
    () => import('@/components/map/CustomerMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                Loading map...
            </div>
        ),
    }
)

// ── Types ──────────────────────────────────────
interface Order {
    orderId: string
    status: string
    customer: { name: string; phone: string }
    deliveryAddress: { text: string; lat: number; lng: number }
    driver: { name: string; phone: string } | null
    driverLocation: { lat: number; lng: number } | null
    warehouse: string
    timeline: {
        assignedAt: string | null
        pickedUpAt: string | null
        deliveredAt: string | null
    }
}

// ── Status steps for the stepper ──────────────
const STATUS_STEPS = [
    { key: 'assigned', label: 'Driver assigned' },
    { key: 'picked_up', label: 'Picked up' },
    { key: 'in_transit', label: 'On the way' },
    { key: 'delivered', label: 'Delivered' },
]

const STATUS_ORDER = ['assigned', 'picked_up', 'in_transit', 'delivered']

export default function TrackOrderPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Fetch order on page load
    useEffect(() => {
        if (!orderId) return
        fetchOrder()

        // Refresh every 15 seconds to get latest status
        const interval = setInterval(fetchOrder, 15000)
        return () => clearInterval(interval)
    }, [orderId])

    const fetchOrder = async () => {
        try {
            const res = await fetch(
                `http://localhost:3002/orders/track/${orderId}`
            )
            const data = await res.json()

            if (!data.success) {
                setError('Order not found')
                return
            }

            setOrder(data.data.order)
        } catch (err) {
            setError('Could not load order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Get current step index for stepper
    const currentStepIndex = order
        ? STATUS_ORDER.indexOf(order.status)
        : -1

    // ── Loading state ────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading your order...</div>
            </div>
        )
    }

    // ── Error state ──────────────────────────────
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-2">😕</div>
                    <div className="text-gray-600 text-sm">{error || 'Order not found'}</div>
                </div>
            </div>
        )
    }

    // ── Main render ──────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-green-600 text-white px-4 py-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🛒</span>
                    <span className="font-semibold">QuickDeliver</span>
                </div>
                <p className="text-green-100 text-sm">
                    Tracking order #{order.orderId}
                </p>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-4">

                {/* Map — only show if driver has location */}
                {order.driverLocation ? (
                    <CustomerMap
                        driverLat={order.driverLocation.lat}
                        driverLng={order.driverLocation.lng}
                        customerLat={order.deliveryAddress.lat}
                        customerLng={order.deliveryAddress.lng}
                        height="240px"
                    />
                ) : (
                    <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                        Map will appear when driver starts moving
                    </div>
                )}

                {/* Status stepper */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                            Order status
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        {STATUS_STEPS.map((step, index) => (
                            <div key={step.key} className="flex items-center flex-1">
                                {/* Dot */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${index <= currentStepIndex
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                        }`} />
                                    <span className="text-[10px] text-gray-500 mt-1 text-center w-14 leading-tight">
                                        {step.label}
                                    </span>
                                </div>
                                {/* Line between dots */}
                                {index < STATUS_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mb-4 ${index < currentStepIndex
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Driver info */}
                {order.driver && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-xs text-gray-500 mb-2">Your delivery driver</div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                                {order.driver.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {order.driver.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {order.driver.phone}
                                </div>
                            </div>
                            <a
                                href={`tel:${order.driver.phone}`}
                                className="ml-auto bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg border border-green-200"
                            >
                                Call
                            </a>
                        </div>
                    </div>
                )}

                {/* Delivery address */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-xs text-gray-500 mb-1">Delivering to</div>
                    <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {order.deliveryAddress.text}
                    </div>
                </div>

                {/* Delivered message */}
                {order.status === 'delivered' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">✅</div>
                        <div className="text-sm font-medium text-green-800">
                            Order delivered successfully!
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            {order.timeline.deliveredAt
                                ? new Date(order.timeline.deliveredAt).toLocaleTimeString()
                                : ''}
                        </div>
                    </div>
                )}

                {/* Failed message */}
                {order.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">❌</div>
                        <div className="text-sm font-medium text-red-800">
                            Delivery was unsuccessful
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                            Our team will contact you shortly
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pb-4">
                    Page refreshes automatically every 15 seconds
                </div>

            </div>
        </div >
    )
}