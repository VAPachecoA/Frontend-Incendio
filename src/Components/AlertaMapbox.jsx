import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const FALLBACK_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN


const CUSTOM_STYLE = 'mapbox://styles/nico-sxchez/cmngv8iz9001h01qw0e5fe0lo'
const EVACUATION_RADIUS = 60

const EVACUATION_AREA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Sector de evacuación' },
      geometry: {
        type: 'Point',
        coordinates: [-70.642, -33.444],
      },
    },
  ],
}

const FIRE_POINT = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { title: 'Incendio El Roble' },
      geometry: {
        type: 'Point',
        coordinates: [-70.642, -33.444],
      },
    },
  ],
}

export default function AlertaMapbox() {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || FALLBACK_TOKEN

    if (!mapContainerRef.current || mapRef.current) return undefined

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: CUSTOM_STYLE,
      center: [-70.642, -33.444],
      zoom: 11.2,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('load', () => {
      map.addSource('alert-area', {
        type: 'geojson',
        data: EVACUATION_AREA,
      })

      map.addSource('alert-fire', {
        type: 'geojson',
        data: FIRE_POINT,
      })

      map.addLayer({
        id: 'alert-area-fill',
        type: 'circle',
        source: 'alert-area',
        paint: {
          'circle-color': '#ef4444',
          'circle-opacity': 0.22,
          'circle-radius': EVACUATION_RADIUS,
        },
      })

      map.addLayer({
        id: 'alert-area-line',
        type: 'circle',
        source: 'alert-area',
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#b91c1c',
          'circle-stroke-width': 2.5,
          'circle-radius': EVACUATION_RADIUS,
        },
      })

      map.addLayer({
        id: 'alert-fire-circle',
        type: 'circle',
        source: 'alert-fire',
        paint: {
          'circle-radius': 12,
          'circle-color': '#dc2626',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })

      map.addLayer({
        id: 'alert-fire-label',
        type: 'symbol',
        source: 'alert-fire',
        layout: {
          'text-field': ['get', 'title'],
          'text-size': 12,
          'text-offset': [0, 1.3],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#111827',
          'text-halo-width': 1,
        },
      })

      map.resize()
    })

    mapRef.current = map

    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })

    resizeObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={mapContainerRef} className="h-65 w-full flex-1 overflow-hidden rounded-2xl" />
}