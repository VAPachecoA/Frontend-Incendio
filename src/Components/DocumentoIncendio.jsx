import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AlertaMapbox from './AlertaMapbox'
import { obtenerIncidenteActivo, obtenerRespuestas } from '../services/estoyBienService'

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  return new Date(fechaStr).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function DocumentoIncendio() {
  const incidente = obtenerIncidenteActivo()
  const [respuestas, setRespuestas] = useState([])

  const cargarDatos = () => {
    setRespuestas(obtenerRespuestas())
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const personasEvacuar = useMemo(
    () => respuestas.filter((r) => r.estado === 'evacuar'),
    [respuestas],
  )
  const personasEstoyBien = useMemo(
    () => respuestas.filter((r) => r.estado === 'estoy_bien'),
    [respuestas],
  )

  const handleImprimir = () => {
    window.print()
  }

  const handleExportar = () => {
    const lineas = [
      'REPORTE DE INCENDIO Y EVACUACIÓN',
      `Incendio: ${incidente.nombre}`,
      `Nivel: ${incidente.nivel}`,
      `Sector: ${incidente.sector}`,
      `Área afectada: ${incidente.areaAfectada} ha`,
      `Coordenadas: ${incidente.latitud}, ${incidente.longitud}`,
      '',
      'PERSONAS QUE NECESITAN EVACUAR',
      'Nombre,Teléfono,Zona,Mensaje,Fecha',
      ...personasEvacuar.map((p) =>
        [p.nombre, p.telefono, p.zona, p.mensaje, p.fecha]
          .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
      '',
      'PERSONAS QUE CONFIRMARON ESTAR BIEN',
      'Nombre,Teléfono,Zona,Mensaje,Fecha',
      ...personasEstoyBien.map((p) =>
        [p.nombre, p.telefono, p.zona, p.mensaje, p.fecha]
          .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
    ]

    const blob = new Blob([lineas.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_incendio_${incidente.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 print:max-w-none print:px-0">
      <div className="overflow-hidden rounded-2xl border border-[#e6d6d6] bg-white text-slate-900 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 print:bg-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Documento de evacuación
            </p>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Reporte de personas evacuadas</h1>
            <p className="mt-1 text-sm text-slate-600">
              Generado: {new Date().toLocaleString('es-CL')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={cargarDatos}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleExportar}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleImprimir}
              className="rounded-lg bg-[#C82323] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a31d1d]"
            >
              Imprimir documento
            </button>
            <Link
              to="/alertas"
              className="rounded-lg border border-[#C82323] px-4 py-2 text-sm font-semibold text-[#C82323] hover:bg-rose-50"
            >
              Volver a alertas
            </Link>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <article className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-[#C82323] px-3 py-1 text-xs font-bold text-white">
                  {incidente.nivel}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{incidente.nombre}</h2>
                <p className="mt-1 text-sm text-slate-700">{incidente.descripcion}</p>
              </div>
              <div className="grid min-w-[220px] gap-2 text-sm">
                <p><span className="font-semibold">Sector:</span> {incidente.sector}</p>
                <p><span className="font-semibold">Hora inicio:</span> {incidente.horaInicio} hrs</p>
                <p><span className="font-semibold">Extensión:</span> {incidente.areaAfectada} ha</p>
                <p><span className="font-semibold">Viento:</span> {incidente.viento}</p>
                <p><span className="font-semibold">Coordenadas:</span> {incidente.latitud}, {incidente.longitud}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">Zonas en evacuación:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {incidente.zonasEvacuacion.map((zona) => (
                  <li
                    key={zona}
                    className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900"
                  >
                    {zona}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-center">
              <p className="text-sm text-slate-600">Necesitan evacuar</p>
              <p className="text-3xl font-bold text-[#8f1d1d]">{personasEvacuar.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm text-slate-600">Confirmaron &quot;Estoy bien&quot;</p>
              <p className="text-3xl font-bold text-emerald-800">{personasEstoyBien.length}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center">
              <p className="text-sm text-slate-600">Total respuestas</p>
              <p className="text-3xl font-bold text-[#1f5f8f]">{respuestas.length}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] print:block">
            <div className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-slate-900">Mapa del incendio</h3>
              <p className="mt-1 text-sm text-slate-600">
                Ubicación del foco y sector de evacuación.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 print:hidden">
                <AlertaMapbox />
              </div>
              <p className="mt-3 hidden text-sm text-slate-600 print:block">
                Coordenadas del foco: {incidente.latitud}, {incidente.longitud}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-slate-900">Personas que necesitan evacuar</h3>
              <p className="mt-1 text-sm text-slate-600">
                Ciudadanos que reportaron requerir apoyo o evacuación inmediata.
              </p>

              {personasEvacuar.length === 0 ? (
                <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No hay personas registradas que necesiten evacuar.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-rose-50 text-xs font-semibold uppercase text-rose-800">
                      <tr>
                        {['Nombre', 'Teléfono', 'Zona', 'Mensaje', 'Fecha'].map((col) => (
                          <th key={col} className="px-3 py-2 text-left">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {personasEvacuar.map((persona) => (
                        <tr key={persona.id} className="align-top">
                          <td className="px-3 py-3 font-medium text-slate-900">{persona.nombre}</td>
                          <td className="px-3 py-3 text-slate-700">{persona.telefono}</td>
                          <td className="px-3 py-3 text-slate-700">{persona.zona}</td>
                          <td className="px-3 py-3 text-slate-600">{persona.mensaje || '—'}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                            {formatFecha(persona.fecha)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900">Personas que confirmaron &quot;Estoy bien&quot;</h3>
            {personasEstoyBien.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Sin confirmaciones registradas.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-emerald-50 text-xs font-semibold uppercase text-emerald-800">
                    <tr>
                      {['Nombre', 'Teléfono', 'Zona', 'Mensaje', 'Fecha'].map((col) => (
                        <th key={col} className="px-3 py-2 text-left">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personasEstoyBien.map((persona) => (
                      <tr key={persona.id}>
                        <td className="px-3 py-3 font-medium text-slate-900">{persona.nombre}</td>
                        <td className="px-3 py-3 text-slate-700">{persona.telefono}</td>
                        <td className="px-3 py-3 text-slate-700">{persona.zona}</td>
                        <td className="px-3 py-3 text-slate-600">{persona.mensaje || '—'}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                          {formatFecha(persona.fecha)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
