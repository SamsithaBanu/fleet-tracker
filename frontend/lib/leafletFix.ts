// frontend/lib/leafletFix.ts

import L from 'leaflet'

// Fix default marker icons broken in Next.js/Webpack
export const fixLeafletIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
}

// Custom colored marker — used for driver, warehouse, customer
export const createColorMarker = (color: string) => {
    return L.divIcon({
        className: '',
        html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    })
}

// Specific markers for our app
export const driverMarker = createColorMarker('#16a34a') // green
export const warehouseMarker = createColorMarker('#2563eb') // blue
export const customerMarker = createColorMarker('#dc2626') // red