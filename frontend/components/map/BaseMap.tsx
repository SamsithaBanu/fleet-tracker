// frontend/components/map/BaseMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import { fixLeafletIcons } from '@/lib/leafletFix'

interface Props {
    center?: [number, number]  // [lat, lng]
    zoom?: number
    height?: string
    className?: string
    onMapReady?: (map: any) => void
}

export default function BaseMap({
    center = [12.9716, 77.5946], // Bangalore center
    zoom = 12,
    height = '400px',
    className = '',
    onMapReady,
}: Props) {
    const mapRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)

    useEffect(() => {
        // Must import leaflet only on client side
        const initMap = async () => {
            const L = (await import('leaflet')).default
            fixLeafletIcons()

            // Prevent creating map twice
            if (mapInstanceRef.current) return

            // Create the map
            const map = L.map(mapRef.current, {
                center,
                zoom,
                zoomControl: true,
            })

            // Add OpenStreetMap tiles (free)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map)

            setTimeout(() => {
                map.invalidateSize()
            }, 100)

            mapInstanceRef.current = map

            // Give parent component access to map instance
            if (onMapReady) onMapReady(map)
        }

        initMap()

        // Cleanup when component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

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