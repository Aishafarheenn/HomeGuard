import React, { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  height = 240,
  className = '',
}) {
  const hasPosition = latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
  const position = hasPosition ? [Number(latitude), Number(longitude)] : null
  const center = position || DEFAULT_CENTER

  const handleDragEnd = useCallback(
    (e) => {
      const marker = e.target
      const latlng = marker.getLatLng()
      onLocationSelect?.(latlng.lat, latlng.lng)
    },
    [onLocationSelect]
  )

  return (
    <div className={`rounded-xl border border-slate-200 overflow-hidden bg-slate-50 ${className}`} style={{ minHeight: height }}>
      <MapContainer
        center={center}
        zoom={hasPosition ? 14 : DEFAULT_ZOOM}
        className="h-full w-full"
        style={{ height }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {position && (
          <Marker
            position={position}
            draggable
            eventHandlers={{ dragend: handleDragEnd }}
          />
        )}
      </MapContainer>
      <p className="text-xs text-slate-500 px-3 py-2 bg-white border-t border-slate-100">
        {hasPosition
          ? 'Drag the marker or click elsewhere on the map to change location.'
          : 'Click on the map to set the property location.'}
      </p>
    </div>
  )
}
