// frontend/components/map/LiveMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import { fixLeafletIcons } from '@/lib/leafletFix'

interface Driver {
    id: string
    name: string
    lat: number
    lng: number
    speed?: number
    orderId?: string
}

interface Warehouse {
    _id: string
    name: string
    address?: string
    location: { lat: number; lng: number }
    activeOrders?: number
    onlineDrivers?: number
}

interface Order {
    _id: string
    orderId: string
    status: string
    customer: { name: string; phone: string }
    deliveryAddress: { text: string; lat: number; lng: number }
    driverId?: { name: string } | null
}

interface Props {
    drivers?: Driver[]
    warehouses?: Warehouse[]
    orders?: Order[]
    height?: string
}

// Create colored pin marker
const createPin = (L: any, color: string) =>
    L.divIcon({
        className: '',
        html: `<div style="
      width:28px;height:28px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -32],
    })

export default function LiveMap({
    drivers = [],
    warehouses = [],
    orders = [],
    height = '500px',
}: Props) {
    const mapRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)
    const driverMarkersRef = useRef<Record<string, any>>({})
    const warehouseMarkersRef = useRef<any[]>([])
    const orderMarkersRef = useRef<Record<string, any>>({})

    // ── Step 1: Init map ──────────────────────
    useEffect(() => {
        const initMap = async () => {
            const L = (await import('leaflet')).default
            fixLeafletIcons()
            if (mapInstanceRef.current) return

            const map = L.map(mapRef.current, {
                center: [12.9716, 77.5946],
                zoom: 12,
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map)

            setTimeout(() => map.invalidateSize(true), 200)
            mapInstanceRef.current = map
        }

        initMap()
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // ── Step 2: Warehouse markers (blue) ──────
    useEffect(() => {
        const run = async () => {
            const L = (await import('leaflet')).default
            const map = mapInstanceRef.current
            if (!map || warehouses.length === 0) return

            warehouseMarkersRef.current.forEach(m => m.remove())
            warehouseMarkersRef.current = []

            warehouses.forEach(wh => {
                if (!wh.location?.lat || !wh.location?.lng) return

                const marker = L.marker(
                    [wh.location.lat, wh.location.lng],
                    { icon: createPin(L, '#2563eb') }  // blue
                )
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px;padding:2px">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px">
                🏪 ${wh.name}
              </div>
              <div style="font-size:11px;color:#6b7280;margin-bottom:6px">
                ${wh.address || ''}
              </div>
              <div style="display:flex;gap:8px;font-size:11px">
                <span style="color:#16a34a">
                  📦 ${wh.activeOrders || 0} active
                </span>
                <span style="color:#2563eb">
                  🛵 ${wh.onlineDrivers || 0} online
                </span>
              </div>
            </div>
          `)

                warehouseMarkersRef.current.push(marker)
            })
        }
        run()
    }, [warehouses])

    // ── Step 3: Order delivery markers (red) ──
    // Shows WHERE each active order needs to be delivered
    useEffect(() => {
        const run = async () => {
            const L = (await import('leaflet')).default
            const map = mapInstanceRef.current
            if (!map) return

            // Remove old order markers
            Object.values(orderMarkersRef.current).forEach((m: any) => m.remove())
            orderMarkersRef.current = {}

            orders.forEach(order => {
                const lat = order.deliveryAddress?.lat
                const lng = order.deliveryAddress?.lng

                // Skip if no coordinates or zero coordinates
                if (!lat || !lng || lat === 0 || lng === 0) return

                // Color based on order status
                const color = {
                    pending: '#cf39d4ff',  // gray
                    assigned: '#f59e0b',  // amber
                    picked_up: '#3b82f6',  // blue
                    in_transit: '#8b5cf6',  // purple
                    delivered: '#16a34a',  // green
                    failed: '#ef4444',  // red
                }[order.status] || '#ef4444'

                const marker = L.marker(
                    [lat, lng],
                    { icon: createPin(L, color) }
                )
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px;padding:2px">
              <div style="font-weight:700;font-size:12px;margin-bottom:4px">
                📦 ${order.orderId}
              </div>
              <div style="font-size:11px;margin-bottom:2px">
                👤 ${order.customer?.name} · ${order.customer?.phone}
              </div>
              <div style="font-size:11px;color:#6b7280;margin-bottom:6px">
                📍 ${order.deliveryAddress?.text}
              </div>
              <span style="
                font-size:10px;font-weight:600;
                padding:2px 8px;border-radius:10px;
                background:${color}22;color:${color};
              ">
                ${order.status.replace('_', ' ').toUpperCase()}
              </span>
              ${order.driverId ? `
                <div style="font-size:11px;margin-top:6px;color:#16a34a">
                  🛵 Driver: ${(order.driverId as any).name}
                </div>
              ` : `
                <div style="font-size:11px;margin-top:6px;color:#9ca3af">
                  No driver assigned yet
                </div>
              `}
            </div>
          `)

                orderMarkersRef.current[order._id] = marker
            })
        }
        run()
    }, [orders])

    // ── Step 4: Driver live markers (green) ───
    // EMPTY NOW — will be filled by WebSocket in tracking service
    useEffect(() => {
        const run = async () => {
            const L = (await import('leaflet')).default
            const map = mapInstanceRef.current
            if (!map) return

            drivers.forEach(driver => {
                const position: [number, number] = [driver.lat, driver.lng]

                if (driverMarkersRef.current[driver.id]) {
                    // Move existing marker
                    driverMarkersRef.current[driver.id].setLatLng(position)
                } else {
                    // Create new driver marker
                    const marker = L.marker(
                        position,
                        { icon: createPin(L, '#16a34a') }  // green
                    )
                        .addTo(map)
                        .bindPopup(`
              <div style="font-family:sans-serif;padding:2px">
                <div style="font-weight:700;margin-bottom:4px">
                  🛵 ${driver.name}
                </div>
                <div style="font-size:11px;color:#6b7280">
                  Speed: ${driver.speed || 0} km/h
                </div>
                ${driver.orderId ? `
                  <div style="font-size:11px;color:#16a34a;margin-top:4px">
                    📦 On delivery
                  </div>
                ` : `
                  <div style="font-size:11px;color:#9ca3af;margin-top:4px">
                    🟢 Available
                  </div>
                `}
              </div>
            `)

                    driverMarkersRef.current[driver.id] = marker
                }
            })

            // Remove drivers no longer active
            Object.keys(driverMarkersRef.current).forEach(id => {
                if (!drivers.find(d => d.id === id)) {
                    driverMarkersRef.current[id].remove()
                    delete driverMarkersRef.current[id]
                }
            })
        }
        run()
    }, [drivers])

    return (
        <div style={{ position: 'relative' }}>
            <div
                ref={mapRef}
                style={{ height, width: '100%', position: 'relative', zIndex: 0 }}
                className="rounded-xl overflow-hidden border border-gray-200"
            />
            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '10px',
                zIndex: 1000,
                background: 'white',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
                    Warehouse
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    Order delivery point
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} />
                    Driver (live — after tracking service)
                </div>
            </div>
        </div>
    )
}