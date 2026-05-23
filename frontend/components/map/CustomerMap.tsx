// frontend/components/map/CustomerMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import { fixLeafletIcons, driverMarker, customerMarker, warehouseMarker } from '@/lib/leafletFix'

interface Props {
    driverLat?: number
    driverLng?: number
    customerLat: number
    customerLng: number
    warehouseLat?: number
    warehouseLng?: number
    height?: string
}

export default function CustomerMap({
    driverLat,
    driverLng,
    customerLat,
    customerLng,
    warehouseLat,
    warehouseLng,
    height = '280px',
}: Props) {
    const mapRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)
    const driverMarkerRef = useRef<any>(null)

    useEffect(() => {
        const initMap = async () => {
            const L = (await import('leaflet')).default
            fixLeafletIcons()

            if (mapInstanceRef.current) return

            // Center map on customer location
            const map = L.map(mapRef.current, {
                center: [customerLat, customerLng],
                zoom: 14,
                zoomControl: false, // cleaner for mobile
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map)

            setTimeout(() => {
                map.invalidateSize()
            }, 100)

            // Customer marker — red pin
            L.marker([customerLat, customerLng], { icon: customerMarker })
                .addTo(map)
                .bindPopup('📍 Delivery here')
                .openPopup()

            // Warehouse marker — blue pin
            if (warehouseLat && warehouseLng) {
                L.marker([warehouseLat, warehouseLng], { icon: warehouseMarker })
                    .addTo(map)
                    .bindPopup('🏪 Picked up from here')
            }

            // Driver marker — green pin (if driver location available)
            if (driverLat && driverLng) {
                driverMarkerRef.current = L.marker(
                    [driverLat, driverLng],
                    { icon: driverMarker }
                )
                    .addTo(map)
                    .bindPopup('🛵 Your delivery driver')
            }

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

    // Move driver marker when location updates (WebSocket)
    useEffect(() => {
        if (!driverMarkerRef.current || !driverLat || !driverLng) return
        driverMarkerRef.current.setLatLng([driverLat, driverLng])
    }, [driverLat, driverLng])

    return (
        <div
            ref={mapRef}
            style={{
                height: height,
                width: '100%',        // ← add this
                position: 'relative', // ← add this
                zIndex: 0,            // ← add this
            }}
            className="rounded-xl overflow-hidden border border-gray-200"
        />
    )
}