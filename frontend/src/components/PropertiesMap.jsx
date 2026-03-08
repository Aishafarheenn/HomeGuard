import React, { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon in bundlers (Vite/Webpack)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const DEFAULT_CENTER = [11.2588, 75.7804]
const DEFAULT_ZOOM = 10

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (!positions.length) return
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 })
  }, [map, positions])
  return null
}

export default function PropertiesMap({ properties, className = '' }) {
  const positions = useMemo(() => {
    return (properties || [])
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [Number(p.latitude), Number(p.longitude)])
  }, [properties])

  const center = useMemo(() => {
    if (positions.length === 0) return DEFAULT_CENTER
    const sumLat = positions.reduce((a, [lat]) => a + lat, 0)
    const sumLng = positions.reduce((a, [, lng]) => a + lng, 0)
    return [sumLat / positions.length, sumLng / positions.length]
  }, [positions])

  if (positions.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 ${className}`} style={{ minHeight: 320 }}>
        <p>No properties with coordinates to show on map. Add latitude and longitude to properties.</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-slate-200 overflow-hidden bg-white ${className}`} style={{ minHeight: 320 }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ height: 320 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {properties
          .filter((p) => p.latitude != null && p.longitude != null)
          .map((p) => (
            <Marker key={p.id} position={[Number(p.latitude), Number(p.longitude)]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium text-slate-800">{p.address || 'Property'}</p>
                  {p.owner?.full_name && <p className="text-slate-600">{p.owner.full_name}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
