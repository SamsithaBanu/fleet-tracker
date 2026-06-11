// // frontend/app/dashboard/map/page.tsx
// 'use client'

// import dynamic from 'next/dynamic'

// const LiveMap = dynamic(
//     () => import('@/components/map/LiveMap'),
//     {
//         ssr: false,
//         loading: () => (
//             <div className="h-[500px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
//                 Loading map...
//             </div>
//         ),
//     }
// )

// // ── Static warehouse data (3 Bangalore locations) ──
// const WAREHOUSES = [
//     {
//         _id: '1',
//         name: 'Koramangala Warehouse',
//         address: '5th Block, Koramangala, Bengaluru',
//         location: { lat: 12.9352, lng: 77.6245 },
//         activeOrders: 12,
//         onlineDrivers: 4,
//     },
//     {
//         _id: '2',
//         name: 'Indiranagar Warehouse',
//         address: '12th Main, Indiranagar, Bengaluru',
//         location: { lat: 12.9784, lng: 77.6408 },
//         activeOrders: 8,
//         onlineDrivers: 3,
//     },
//     {
//         _id: '3',
//         name: 'Whitefield Warehouse',
//         address: 'ITPL Road, Whitefield, Bengaluru',
//         location: { lat: 12.9698, lng: 77.7500 },
//         activeOrders: 6,
//         onlineDrivers: 2,
//     },
// ]

// // ── Static driver data ──────────────────────────
// const DRIVERS = [
//     {
//         id: 'd1',
//         name: 'Ravi Kumar',
//         lat: 12.9310,
//         lng: 77.6200,
//         speed: 32,
//         orderId: 'ORD-001',
//     },
//     {
//         id: 'd2',
//         name: 'Suresh Nair',
//         lat: 12.9820,
//         lng: 77.6450,
//         speed: 18,
//         orderId: null,
//     },
//     {
//         id: 'd3',
//         name: 'Meena Reddy',
//         lat: 12.9650,
//         lng: 77.7480,
//         speed: 24,
//         orderId: 'ORD-003',
//     },
//     {
//         id: 'd4',
//         name: 'Arjun Singh',
//         lat: 12.9100,
//         lng: 77.6100,
//         speed: 0,
//         orderId: null,
//     },
//     {
//         id: 'd5',
//         name: 'Kiran Patel',
//         lat: 12.9900,
//         lng: 77.6600,
//         speed: 41,
//         orderId: 'ORD-007',
//     },
// ]

// // ── Static order delivery locations ────────────
// const ORDERS = [
//     {
//         _id: 'o1',
//         orderId: 'ORD-001',
//         status: 'in_transit',
//         customer: { name: 'Rohan Mehta', phone: '+91 98765 11111' },
//         deliveryAddress: {
//             text: '14, 5th Cross, HSR Layout, Bengaluru',
//             lat: 12.9116,
//             lng: 77.6389,
//         },
//         driverId: { name: 'Ravi Kumar' },
//     },
//     {
//         _id: 'o2',
//         orderId: 'ORD-002',
//         status: 'assigned',
//         customer: { name: 'Sneha Patel', phone: '+91 98765 22222' },
//         deliveryAddress: {
//             text: 'Residency Road, Richmond Town, Bengaluru',
//             lat: 12.9719,
//             lng: 77.6012,
//         },
//         driverId: null,
//     },
//     {
//         _id: 'o3',
//         orderId: 'ORD-003',
//         status: 'picked_up',
//         customer: { name: 'Amit Kumar', phone: '+91 98765 33333' },
//         deliveryAddress: {
//             text: 'MG Road, Shivaji Nagar, Bengaluru',
//             lat: 12.9767,
//             lng: 77.6101,
//         },
//         driverId: { name: 'Meena Reddy' },
//     },
//     {
//         _id: 'o4',
//         orderId: 'ORD-004',
//         status: 'pending',
//         customer: { name: 'Priya Lakshmi', phone: '+91 98765 44444' },
//         deliveryAddress: {
//             text: 'Jayanagar 4th Block, Bengaluru',
//             lat: 12.9250,
//             lng: 77.5938,
//         },
//         driverId: null,
//     },
//     {
//         _id: 'o5',
//         orderId: 'ORD-005',
//         status: 'in_transit',
//         customer: { name: 'Kiran Bhat', phone: '+91 98765 55555' },
//         deliveryAddress: {
//             text: 'Electronic City Phase 1, Bengaluru',
//             lat: 12.8458,
//             lng: 77.6682,
//         },
//         driverId: { name: 'Kiran Patel' },
//     },
// ]

// export default function MapPage() {
//     return (
//         <div>
//             {/* Header */}
//             <div className="flex items-center justify-between mb-4">
//                 <div>
//                     <h2 className="text-lg font-semibold text-gray-900">
//                         Live map · Bangalore
//                     </h2>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         Static demo data — real data connects after tracking service
//                     </p>
//                 </div>
//                 <div className="flex gap-3 text-xs">
//                     <span className="flex items-center gap-1.5 text-gray-500">
//                         <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
//                         {WAREHOUSES.length} warehouses
//                     </span>
//                     <span className="flex items-center gap-1.5 text-gray-500">
//                         <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
//                         {DRIVERS.length} drivers
//                     </span>
//                     <span className="flex items-center gap-1.5 text-gray-500">
//                         <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
//                         {ORDERS.length} orders
//                     </span>
//                 </div>
//             </div>

//             {/* Map */}
//             <LiveMap
//                 warehouses={WAREHOUSES}
//                 drivers={DRIVERS}
//                 orders={ORDERS}
//                 height="560px"
//             />

//             {/* Stats row below map */}
//             <div className="grid grid-cols-3 gap-3 mt-4">
//                 {WAREHOUSES.map(wh => (
//                     <div
//                         key={wh._id}
//                         className="bg-white border border-gray-200 rounded-xl p-3"
//                     >
//                         <div className="text-xs font-medium text-gray-900 mb-1">
//                             🏪 {wh.name}
//                         </div>
//                         <div className="flex gap-3 text-xs text-gray-500">
//                             <span>📦 {wh.activeOrders} orders</span>
//                             <span>🛵 {wh.onlineDrivers} drivers</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// frontend/app/dashboard/map/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { orderApi } from '@/lib/orderApi'

const LiveMap = dynamic(
  () => import('@/components/map/LiveMap'),
  { ssr: false, loading: () => (
    <div className="h-[560px] bg-gray-100 rounded-xl flex items-center
      justify-center text-gray-400 text-sm">
      Loading map...
    </div>
  )}
)

export default function MapPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [orders, setOrders]         = useState<any[]>([])
  const [drivers, setDrivers]       = useState<Record<string, any>>({})
  const [connected, setConnected]   = useState(false)

  // Fetch warehouses and active orders from API
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      orderApi.getWarehouses(),
      orderApi.getOrders('?status=assigned&limit=50'),
    ]).then(([wh, ord]) => {
      if (wh.success)  setWarehouses(wh.data.warehouses)
      if (ord.success) setOrders(ord.data.orders)
    })
  }, [])

  // Connect to Socket.io and listen for live GPS
  useEffect(() => {
    const socket = getSocket()

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join:fleet')  // join fleet dashboard room
    })

    socket.on('disconnect', () => setConnected(false))

    // This fires every time a driver's GPS updates
    socket.on('location:update', (data) => {
      // Update this driver's position in state
      setDrivers(prev => ({
        ...prev,
        [data.driverId]: {
          id:      data.driverId,
          name:    data.name || `Driver ${data.driverId.slice(-4)}`,
          lat:     data.lat,
          lng:     data.lng,
          speed:   data.speed,
          orderId: data.orderId,
        }
      }))
    })

    return () => {
      socket.off('location:update')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  // Convert drivers object to array for the map
  const driversArray = Object.values(drivers)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Live map · Bangalore
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected
              ? '🟢 Connected — receiving live GPS'
              : '🔴 Connecting to live tracking...'}
          </p>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span>🔵 {warehouses.length} warehouses</span>
          <span>🟢 {driversArray.length} drivers live</span>
          <span>📦 {orders.length} active orders</span>
        </div>
      </div>

      <LiveMap
        warehouses={warehouses}
        drivers={driversArray}
        orders={orders}
        height="560px"
      />

      {/* Live drivers list */}
      {driversArray.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            Live drivers
          </p>
          <div className="flex flex-wrap gap-2">
            {driversArray.map(d => (
              <div
                key={d.id}
                className="flex items-center gap-2 bg-gray-50 border
                  border-gray-200 rounded-lg px-3 py-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-700">{d.name}</span>
                <span className="text-xs text-gray-400">{d.speed} km/h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}