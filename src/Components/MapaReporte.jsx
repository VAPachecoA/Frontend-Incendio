import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'


const CUSTOM_STYLE = 'mapbox://styles/nico-sxchez/cmngv8iz9001h01qw0e5fe0lo'
const FALLBACK_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
export default function MapaReporte({ onCoordsChange }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || FALLBACK_TOKEN

    if (!mapContainerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: CUSTOM_STYLE,
      center: [-70.64, -33.45],
      zoom: 10,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    // Cambiar cursor al entrar al mapa para indicar que es clickeable
    map.getCanvas().style.cursor = 'crosshair'

    map.on('click', (event) => {
      const { lng, lat } = event.lngLat
      const roundedLng = Math.round(lng * 10000) / 10000
      const roundedLat = Math.round(lat * 10000) / 10000

      // Mover o crear el marcador
      if (markerRef.current) {
        markerRef.current.setLngLat([roundedLng, roundedLat])
      } else {
        // Marcador rojo personalizado
        const el = document.createElement('div')
        el.style.cssText = `
          width: 28px;
          height: 28px;
          background: #b80d0d;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        `
        markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([roundedLng, roundedLat])
          .addTo(map)
      }

      setCoords({ lat: roundedLat, lng: roundedLng })
      onCoordsChange({ lat: roundedLat, lng: roundedLng })
    })

    mapRef.current = map

    return () => {
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-64 w-full rounded-lg" />
      {coords ? (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>
            Ubicacion marcada — Lat: <strong>{coords.lat}</strong>, Lng: <strong>{coords.lng}</strong>
          </span>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Haz clic en el mapa para marcar la ubicacion exacta del incendio.
        </p>
      )}
    </div>
  )
}