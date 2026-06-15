import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const CUSTOM_STYLE = 'mapbox://styles/nico-sxchez/cmngv8iz9001h01qw0e5fe0lo'
const EARTH_RADIUS_KM = 6371
const FIRE_DANGER_BASE_KM = 0.8
const API_REPORTES = 'http://localhost:8083/apireporte/reportes'

function getTodayISO() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const TODAY = getTodayISO()

const levelColor = {
  CRITICO: '#dc2626',
  ALTO: '#f97316',
  MEDIO: '#eab308',
  BAJO: '#16a34a',
  PENDIENTE: '#6b7280',
}

function nivelFromReporte(reporte) {
  if (reporte.nivelGravedad) return reporte.nivelGravedad.toUpperCase()
  return 'PENDIENTE'
}

function reporteToIncident(reporte) {
  const nivel = nivelFromReporte(reporte)
  const fecha = reporte.fechaReporte ? reporte.fechaReporte.split('T')[0] : TODAY
  return {
    id: reporte.id,
    title: reporte.tipoIncendio || 'Incendio',
    level: nivel.toLowerCase(),
    type: 'incendio',
    date: fecha,
    radiusKm: nivel === 'CRITICO' ? 4 : nivel === 'ALTO' ? 3 : 2,
    coordinates: [reporte.longitud, reporte.latitud],
    estado: reporte.estado,
  }
}

function getIncidentColor(item) {
  return levelColor[item.level?.toUpperCase()] ?? '#6b7280'
}

function getFeatureCollection(items) {
  return {
    type: 'FeatureCollection',
    features: items.map((item) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: item.coordinates },
      properties: {
        id: String(item.id),
        type: item.type,
        title: item.title,
        level: item.level,
        estado: item.estado || '',
        color: getIncidentColor(item),
      },
    })),
  }
}

function createCirclePolygon([lng, lat], radiusKm, points = 48) {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const angularDistance = radiusKm / EARTH_RADIUS_KM
  const coordinates = []
  for (let i = 0; i <= points; i++) {
    const bearing = (2 * Math.PI * i) / points
    const sinLat = Math.sin(latRad)
    const cosLat = Math.cos(latRad)
    const sinAd = Math.sin(angularDistance)
    const cosAd = Math.cos(angularDistance)
    const pointLat = Math.asin(sinLat * cosAd + cosLat * sinAd * Math.cos(bearing))
    const pointLng = lngRad + Math.atan2(
      Math.sin(bearing) * sinAd * cosLat,
      cosAd - sinLat * Math.sin(pointLat),
    )
    coordinates.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI])
  }
  return coordinates
}

function getFireZonesFeatureCollection(items) {
  return {
    type: 'FeatureCollection',
    features: items
      .filter((item) => item.type === 'incendio')
      .map((item) => ({
        type: 'Feature',
        properties: { id: String(item.id), title: item.title },
        geometry: {
          type: 'Polygon',
          coordinates: [createCirclePolygon(item.coordinates, (item.radiusKm || 2) + FIRE_DANGER_BASE_KM)],
        },
      })),
  }
}

export default function MapaTiempoReal() {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  const [incidents, setIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [showIncendios, setShowIncendios] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedIncident, setSelectedIncident] = useState(null)

  const cargarReportes = async () => {
  setIsLoading(true)
  setError('')
  try {
    const res = await fetch(API_REPORTES)
    if (!res.ok) throw new Error('Error al cargar reportes')
    const data = await res.json()
    // ← agregar este filtro
    const activos = data.filter((r) => r.estado !== 'CERRADO')
    const converted = activos.map(reporteToIncident)
    setIncidents(converted)
    setLastUpdate(new Date())
  } catch (e) {
    setError('No se pudo conectar con apireporte en el puerto 8083.')
  } finally {
    setIsLoading(false)
  }
}

  useEffect(() => {
    cargarReportes()
    const interval = setInterval(cargarReportes, 30000) // refresca cada 30s
    return () => clearInterval(interval)
  }, [])

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (selectedDate && item.date !== selectedDate) return false
      if (item.type === 'incendio' && !showIncendios) return false
      return true
    })
  }, [incidents, selectedDate, showIncendios])

  const totalIncendiosHoy = useMemo(() =>
    incidents.filter((i) => i.type === 'incendio' && i.date === TODAY).length,
    [incidents]
  )

  const totalCriticos = useMemo(() =>
    incidents.filter((i) => i.level === 'critico').length,
    [incidents]
  )

  const totalPendientes = useMemo(() =>
    incidents.filter((i) => i.estado === 'PENDIENTE').length,
    [incidents]
  )

  // Inicializar mapa
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    if (!mapContainerRef.current || mapRef.current) return undefined

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: CUSTOM_STYLE,
      center: [-70.64, -33.45],
      zoom: 10.5,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      map.addSource('incendios-areas', {
        type: 'geojson',
        data: getFireZonesFeatureCollection([]),
      })
      map.addLayer({
        id: 'incendios-areas-fill',
        type: 'fill',
        source: 'incendios-areas',
        paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.18 },
      })
      map.addLayer({
        id: 'incendios-areas-line',
        type: 'line',
        source: 'incendios-areas',
        paint: { 'line-color': '#dc2626', 'line-width': 2 },
      })

      map.addSource('eventos', {
        type: 'geojson',
        data: getFeatureCollection([]),
      })
      map.addLayer({
        id: 'eventos-circulos',
        type: 'circle',
        source: 'eventos',
        paint: {
          'circle-radius': 12,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      map.addLayer({
        id: 'eventos-labels',
        type: 'symbol',
        source: 'eventos',
        layout: {
          'text-field': ['get', 'title'],
          'text-size': 11,
          'text-offset': [0, 1.4],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#111827',
          'text-halo-width': 1,
        },
      })

      // Click en punto
      map.on('click', 'eventos-circulos', (e) => {
        const props = e.features[0].properties
        const incident = incidents.find((i) => String(i.id) === props.id)
        if (incident) setSelectedIncident(incident)
      })

      map.on('mouseenter', 'eventos-circulos', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'eventos-circulos', () => {
        map.getCanvas().style.cursor = ''
      })

      setMapReady(true)
    })

    mapRef.current = map

    return () => {
      setMapReady(false)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Actualizar datos en el mapa cuando cambian los filtros
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const eventosSource = mapRef.current.getSource('eventos')
    if (eventosSource && 'setData' in eventosSource) {
      eventosSource.setData(getFeatureCollection(filteredIncidents))
    }

    const areasSource = mapRef.current.getSource('incendios-areas')
    if (areasSource && 'setData' in areasSource) {
      areasSource.setData(getFireZonesFeatureCollection(filteredIncidents))
    }

    const visibilidad = showIncendios ? 'visible' : 'none'
    if (mapRef.current.getLayer('incendios-areas-fill')) {
      mapRef.current.setLayoutProperty('incendios-areas-fill', 'visibility', visibilidad)
      mapRef.current.setLayoutProperty('incendios-areas-line', 'visibility', visibilidad)
    }
  }, [filteredIncidents, mapReady, showIncendios])

  return (
    <section className="bg-[#0f172a] px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl border border-black/20 shadow-xl">
        <div ref={mapContainerRef} className="h-[78vh] min-h-140 w-full" />

        {/* Botón sidebar */}
        <button
          type="button"
          className="absolute left-3 top-3 z-20 rounded-md bg-[#0f4b8f] px-3 py-2 text-xs font-semibold text-white shadow hover:bg-[#0c3d74]"
          onClick={() => setIsSidebarOpen((v) => !v)}
        >
          {isSidebarOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        {/* Sidebar */}
        <aside className={`absolute left-3 top-14 z-10 max-h-[calc(78vh-4.5rem)] w-64 overflow-y-auto rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
          <h3 className="mb-3 text-lg font-bold text-slate-800">Filtros</h3>

          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}

          <button
            onClick={cargarReportes}
            disabled={isLoading}
            className="w-full rounded-md bg-[#0f4b8f] py-2 text-sm font-semibold text-white hover:bg-[#0c3d74] disabled:opacity-50 mb-3"
          >
            {isLoading ? 'Cargando...' : '🔄 Actualizar reportes'}
          </button>

          <p className="text-sm font-semibold text-slate-700">Filtrar por fecha</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="mt-1 text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Ver todos
            </button>
          )}

          <p className="mt-4 text-sm font-semibold text-slate-700">Capas</p>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={showIncendios} onChange={(e) => setShowIncendios(e.target.checked)} />
            Incendios / Reportes
          </label>

          <p className="mt-4 text-sm font-semibold text-slate-700">Nivel de Riesgo</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#dc2626]" /> Crítico</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#f97316]" /> Alto</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#eab308]" /> Medio</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#16a34a]" /> Bajo</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6b7280]" /> Pendiente</li>
          </ul>
        </aside>

        {/* Panel detalle incidente */}
        {selectedIncident && (
          <div className="absolute right-3 top-3 z-20 w-72 rounded-lg bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-800">Detalle del Reporte</p>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">ID:</span> {selectedIncident.id}</p>
              <p><span className="font-semibold">Tipo:</span> {selectedIncident.title}</p>
              <p><span className="font-semibold">Nivel:</span>
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  selectedIncident.level === 'critico' ? 'bg-red-100 text-red-800' :
                  selectedIncident.level === 'alto' ? 'bg-orange-100 text-orange-800' :
                  selectedIncident.level === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                  selectedIncident.level === 'bajo' ? 'bg-green-100 text-green-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedIncident.level?.toUpperCase()}
                </span>
              </p>
              <p><span className="font-semibold">Estado:</span> {selectedIncident.estado}</p>
              <p><span className="font-semibold">Fecha:</span> {selectedIncident.date}</p>
              <p><span className="font-semibold">Coordenadas:</span> {selectedIncident.coordinates[1].toFixed(4)}, {selectedIncident.coordinates[0].toFixed(4)}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="absolute bottom-4 left-1/2 z-10 grid w-[90%] -translate-x-1/2 grid-cols-3 gap-3 sm:w-auto sm:min-w-140">
          <div className="rounded-lg bg-white px-5 py-3 text-center shadow-lg">
            <p className="text-3xl font-bold text-[#dc2626]">{totalIncendiosHoy}</p>
            <p className="text-sm text-slate-700">Reportes Hoy</p>
          </div>
          <div className="rounded-lg bg-white px-5 py-3 text-center shadow-lg">
            <p className="text-3xl font-bold text-[#f97316]">{totalCriticos}</p>
            <p className="text-sm text-slate-700">Críticos</p>
          </div>
          <div className="rounded-lg bg-white px-5 py-3 text-center shadow-lg">
            <p className="text-3xl font-bold text-[#eab308]">{totalPendientes}</p>
            <p className="text-sm text-slate-700">Pendientes</p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-4 right-3 z-10 w-44 rounded-lg bg-white/95 p-3 text-xs text-slate-700 shadow-lg">
          <p className="mb-2 font-bold">Leyenda</p>
          <p className="mb-1">🔴 Incendio Crítico</p>
          <p className="mb-1">🟠 Incendio Alto</p>
          <p className="mb-1">🟡 Incendio Medio</p>
          <p className="mb-1">🟢 Incendio Bajo</p>
          <p className="mt-2 text-[11px] text-slate-500">Actualizado: {lastUpdate.toLocaleTimeString('es-CL')}</p>
          <p className="text-[11px] text-slate-400">Auto-refresca cada 30s</p>
        </div>
      </div>
    </section>
  )
}