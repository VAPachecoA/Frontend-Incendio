import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BFF_URL = 'http://localhost:8080/bff/dashboard'

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('nombre') || 'Admin'
  const [tab, setTab] = useState('reportes')

  // Un solo estado con los 4 datasets, en vez de 4 useState separados
  const [datos, setDatos] = useState({ reportes: [], historial: [], usuarios: [], estoyBien: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cerrarSesion = () => {
    localStorage.clear()
    navigate('/')
  }

  // Una sola llamada al BFF trae los 4 datasets juntos
  const cargarDashboard = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(BFF_URL)
      if (!res.ok) throw new Error('Error al cargar el dashboard')
      const data = await res.json()
      setDatos(data)
    } catch (e) {
      setError(e.message + ' — ¿Está corriendo el BFF (puerto 8080) y los 3 microservicios?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDashboard()
  }, [])

  const { reportes, historial, usuarios, estoyBien } = datos

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      // El cambio de estado sigue yendo directo al microservicio (escritura)
      await fetch(`http://localhost:8083/apireporte/estado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      // Y refrescamos todo el dashboard desde el BFF para mantener todo sincronizado
      await cargarDashboard()
    } catch {
      setError('Error al cambiar estado.')
    }
  }

  const tabs = [
    { key: 'reportes', label: '📋 Reportes' },
    { key: 'historial', label: '🔥 Historial' },
    { key: 'usuarios', label: '👥 Usuarios' },
    { key: 'estoyBien', label: '🙋 Estoy Bien' },
  ]

  const statsReportes = {
    total: reportes.length,
    pendientes: reportes.filter((r) => r.estado === 'PENDIENTE').length,
    enAtencion: reportes.filter((r) => r.estado === 'EN_ATENCION').length,
    cerrados: reportes.filter((r) => r.estado === 'CERRADO').length,
  }

  const statsEstoyBien = {
    total: estoyBien.length,
    bien: estoyBien.filter((e) => e.estado === 'estoy_bien').length,
    evacuar: estoyBien.filter((e) => e.estado === 'evacuar').length,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#790C0B] text-white px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs text-white/70 uppercase tracking-widest">Panel de Administración</p>
          <h1 className="text-xl font-bold">Bienvenido, {nombre}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">
            Ver sitio
          </Link>
          <button
            onClick={cerrarSesion}
            className="rounded-md bg-white/10 border border-white/30 px-4 py-2 text-sm hover:bg-white/20"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Stats cards reportes */}
        {tab === 'reportes' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow border border-slate-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-slate-800">{statsReportes.total}</p>
              <p className="text-sm text-slate-500 mt-1">Total reportes</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-yellow-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{statsReportes.pendientes}</p>
              <p className="text-sm text-slate-500 mt-1">Pendientes</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-blue-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{statsReportes.enAtencion}</p>
              <p className="text-sm text-slate-500 mt-1">En atención</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-green-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-green-600">{statsReportes.cerrados}</p>
              <p className="text-sm text-slate-500 mt-1">Cerrados</p>
            </div>
          </div>
        )}

        {/* Stats cards estoy bien */}
        {tab === 'estoyBien' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow border border-slate-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-slate-800">{statsEstoyBien.total}</p>
              <p className="text-sm text-slate-500 mt-1">Total registros</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-green-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-green-600">{statsEstoyBien.bien}</p>
              <p className="text-sm text-slate-500 mt-1">Están bien</p>
            </div>
            <div className="bg-white rounded-xl shadow border border-red-200 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-red-600">{statsEstoyBien.evacuar}</p>
              <p className="text-sm text-slate-500 mt-1">Necesitan evacuar</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-300">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-md transition-colors ${
                  tab === t.key
                    ? 'bg-white border border-b-white border-slate-300 text-[#790C0B]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={cargarDashboard}
            disabled={loading}
            className="mb-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : '🔄 Actualizar todo'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">

          {loading && (
            <div className="py-16 text-center text-slate-500 text-sm">Cargando dashboard...</div>
          )}

          {error && (
            <div className="mx-5 mt-4 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* REPORTES */}
          {!loading && !error && tab === 'reportes' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    {['ID', 'Nombre', 'Teléfono', 'Tipo', 'Descripción', 'Lat', 'Lng', 'Estado', 'Fecha'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportes.length === 0 ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400">Sin reportes</td></tr>
                  ) : reportes.map((r) => (
                    <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.estado === 'CERRADO' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-mono text-slate-500">{r.id}</td>
                      <td className="px-4 py-3">{r.nombre || '—'}</td>
                      <td className="px-4 py-3">{r.telefono}</td>
                      <td className="px-4 py-3">{r.tipoIncendio}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{r.descripcion}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{r.latitud}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{r.longitud}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado}
                          onChange={(e) => cambiarEstado(r.id, e.target.value)}
                          className={`rounded-full px-2 py-1 text-xs font-semibold border cursor-pointer outline-none ${
                            r.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            r.estado === 'EN_ATENCION' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }`}
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="EN_ATENCION">EN ATENCIÓN</option>
                          <option value="CERRADO">CERRADO</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {r.fechaReporte ? new Date(r.fechaReporte).toLocaleString('es-CL') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* HISTORIAL */}
          {!loading && !error && tab === 'historial' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    {['ID', 'Tipo', 'Nivel', 'Área (ha)', 'Lat', 'Lng', 'Fecha inicio', 'Fecha cierre'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historial.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-slate-400">Sin registros</td></tr>
                  ) : historial.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500">{h.id}</td>
                      <td className="px-4 py-3">{h.tipoIncendio}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          h.nivelGravedad === 'CRITICO' ? 'bg-red-100 text-red-800' :
                          h.nivelGravedad === 'ALTO' ? 'bg-orange-100 text-orange-800' :
                          h.nivelGravedad === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>{h.nivelGravedad}</span>
                      </td>
                      <td className="px-4 py-3">{h.areaAfectada}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{h.latitud}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{h.longitud}</td>
                      <td className="px-4 py-3 text-slate-500">{h.fechaInicio}</td>
                      <td className="px-4 py-3 text-slate-500">{h.fechaCierre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* USUARIOS */}
          {!loading && !error && tab === 'usuarios' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    {['ID', 'Nombre', 'Apellido', 'RUT', 'Teléfono', 'Correo', 'Rol'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-slate-400">Sin usuarios</td></tr>
                  ) : usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500">{u.id}</td>
                      <td className="px-4 py-3">{u.nombre}</td>
                      <td className="px-4 py-3">{u.apellido}</td>
                      <td className="px-4 py-3 font-mono">{u.rut}</td>
                      <td className="px-4 py-3">{u.telefono}</td>
                      <td className="px-4 py-3">{u.correo}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.rol || 'CLIENTE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ESTOY BIEN */}
          {!loading && !error && tab === 'estoyBien' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    {['ID', 'Nombre', 'Teléfono', 'Estado', 'Mensaje', 'Correo', 'Lat', 'Lng', 'Fecha'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estoyBien.length === 0 ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400">Sin registros</td></tr>
                  ) : estoyBien.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500">{e.id}</td>
                      <td className="px-4 py-3">{e.nombreUsuario}</td>
                      <td className="px-4 py-3">{e.telefono}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          e.estado === 'estoy_bien' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {e.estado === 'estoy_bien' ? '✓ Estoy bien' : '⚠ Necesita evacuar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">{e.mensaje || '—'}</td>
                      <td className="px-4 py-3">{e.correoUsuario || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{e.latitud || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{e.longitud || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {e.fecha ? new Date(e.fecha).toLocaleString('es-CL') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}