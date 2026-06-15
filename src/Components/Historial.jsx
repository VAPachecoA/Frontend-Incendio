import { useEffect, useMemo, useState } from 'react'
import { obtenerHistorial, obtenerDireccion } from '../services/historialService'

const NIVEL_COLOR = {
  CRITICO: 'bg-red-100 text-red-800',
  ALTO: 'bg-orange-100 text-orange-800',
  MEDIO: 'bg-yellow-100 text-yellow-800',
  BAJO: 'bg-green-100 text-green-800',
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  return new Date(fechaStr).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('Todos')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [direcciones, setDirecciones] = useState({})

  const cargarHistorial = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await obtenerHistorial()
      setHistorial(data)
    } catch (err) {
      setError('No se pudo conectar con el servidor. Verifica que apihistorico esté corriendo en el puerto 8082.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarHistorial()
  }, [])

  useEffect(() => {
    if (historial.length === 0) return
    historial.forEach(async (h) => {
      if (h.latitud && h.longitud) {
        const dir = await obtenerDireccion(h.latitud, h.longitud)
        setDirecciones((prev) => ({ ...prev, [h.id]: dir }))
      }
    })
  }, [historial])

  const niveles = useMemo(() => {
    const set = new Set(historial.map((h) => h.nivelGravedad?.toUpperCase()))
    return ['Todos', ...Array.from(set)]
  }, [historial])

  const filas = useMemo(() => {
    return historial.filter((h) => {
      const nivelOk = filtroNivel === 'Todos' || h.nivelGravedad?.toUpperCase() === filtroNivel
      const tipoOk = !filtroTipo || h.tipoIncendio?.toLowerCase().includes(filtroTipo.toLowerCase())
      return nivelOk && tipoOk
    })
  }, [historial, filtroNivel, filtroTipo])

  const handleExportar = () => {
    const csv = [
      ['ID', 'Tipo Incendio', 'Nivel Gravedad', 'Área (ha)', 'Ubicación', 'Fecha Inicio', 'Fecha Cierre'],
      ...filas.map((h) => [
        h.id,
        h.tipoIncendio,
        h.nivelGravedad,
        h.areaAfectada,
        direcciones[h.id] ?? `${h.latitud}, ${h.longitud}`,
        h.fechaInicio,
        h.fechaCierre,
      ]),
    ]
    const content = csv.map((row) => row.map((c) => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'historial_incendios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-md">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Historial de Incendios</h1>
            <p className="text-sm text-slate-500">
              {isLoading ? 'Cargando...' : `${filas.length} registros encontrados`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
            >
              {niveles.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filtrar por tipo..."
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 w-40"
            />
            <button
              onClick={cargarHistorial}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Actualizar
            </button>
            <button
              onClick={handleExportar}
              disabled={filas.length === 0}
              className="rounded-md bg-[#b80d0d] px-3 py-2 text-sm font-medium text-white hover:bg-[#960909] disabled:opacity-40"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center text-slate-500 text-sm">Cargando historial...</div>
        )}

        {/* Tabla */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  {['ID', 'Tipo', 'Nivel', 'Área (ha)', 'Ubicación', 'Fecha inicio', 'Fecha cierre'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No hay registros.
                    </td>
                  </tr>
                ) : (
                  filas.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{h.id}</td>
                      <td className="px-4 py-3 text-slate-700">{h.tipoIncendio}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${NIVEL_COLOR[h.nivelGravedad?.toUpperCase()] ?? 'bg-slate-100 text-slate-700'}`}>
                          {h.nivelGravedad}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{h.areaAfectada}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">
                        {direcciones[h.id] ? (
                          direcciones[h.id]
                        ) : (
                          <span className="text-slate-400 italic text-xs">Cargando dirección...</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatFecha(h.fechaInicio)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatFecha(h.fechaCierre)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}