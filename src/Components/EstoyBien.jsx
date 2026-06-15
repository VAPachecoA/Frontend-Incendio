import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarRespuesta, verificarProximidadIncendio, obtenerDireccion } from '../services/estoyBienService'

const ESTADOS = {
  estoy_bien: {
    label: 'Estoy bien',
    descripcion: 'Confirmo que estoy a salvo o ya evacué.',
    color: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    activo: 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-500',
  },
  evacuar: {
    label: 'Necesito evacuar',
    descripcion: 'Requiero ayuda o estoy en zona de riesgo.',
    color: 'border-rose-300 bg-rose-50 text-rose-900',
    activo: 'border-rose-600 bg-rose-100 ring-2 ring-rose-500',
  },
}

export default function EstoyBien() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    estado: '',
    mensaje: '',
  })
  const [enviado, setEnviado] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [incendioCercano, setIncendioCercano] = useState(null)
  const [ubicacionVerificada, setUbicacionVerificada] = useState(false)
  const [direccionUsuario, setDireccionUsuario] = useState('')

  const usuario = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const verificarUbicacion = async () => {
    setCargando(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      setCargando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        const [incendio, direccion] = await Promise.all([
          verificarProximidadIncendio(lat, lng),
          obtenerDireccion(lat, lng),
        ])

        setDireccionUsuario(direccion)

        if (!incendio) {
          setError('No hay incendios activos cerca de tu ubicación. No es necesario reportar.')
          setUbicacionVerificada(false)
        } else {
          setIncendioCercano({ ...incendio, latUsuario: lat, lngUsuario: lng })
          setUbicacionVerificada(true)
        }

        setCargando(false)
      },
      () => {
        setError('No se pudo obtener tu ubicación. Permite el acceso al GPS e intenta nuevamente.')
        setCargando(false)
      }
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.nombre.trim()) { setError('Ingresa tu nombre.'); return }
    if (!formData.telefono.trim()) { setError('Ingresa un teléfono de contacto.'); return }
    if (!formData.estado) { setError('Selecciona si estás bien o necesitas evacuar.'); return }

    setCargando(true)
    try {
      const respuesta = await registrarRespuesta({
        ...formData,
        usuario,
        latitud: incendioCercano.latUsuario,
        longitud: incendioCercano.lngUsuario,
        idReporte: incendioCercano.id,
        direccion: direccionUsuario,
      })
      setEnviado({ ...respuesta, direccion: direccionUsuario })
      setFormData({ nombre: '', telefono: '', estado: '', mensaje: '' })
    } catch {
      setError('Error al enviar. Verifica tu conexión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sistema "Estoy bien"</h2>
          <p className="mt-1 text-sm text-slate-600">
            Confirma tu estado si estás cerca de un incendio activo.
          </p>
        </div>
        <Link
          to="/reportar"
          className="rounded-lg border border-[#C82323] px-4 py-2 text-sm font-semibold text-[#C82323] transition-colors hover:bg-rose-50"
        >
          Reportar incendio
        </Link>
      </div>

      {enviado ? (
        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
          enviado.estado === 'estoy_bien'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}>
          <p className="font-semibold">
            {enviado.estado === 'estoy_bien'
              ? 'Gracias, tu confirmación fue registrada.'
              : 'Tu solicitud de evacuación fue registrada. Mantente en contacto.'}
          </p>
          <p className="mt-1">{enviado.nombreUsuario} — {ESTADOS[enviado.estado]?.label}</p>
          {enviado.direccion && (
            <p className="mt-1 text-xs">📍 {enviado.direccion}</p>
          )}
          <button
            type="button"
            onClick={() => { setEnviado(null); setUbicacionVerificada(false); setIncendioCercano(null) }}
            className="mt-3 text-sm font-semibold underline"
          >
            Enviar otra respuesta
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">

          {/* Paso 1 — verificar ubicación */}
          {!ubicacionVerificada ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Paso 1 — Verifica si estás en zona de riesgo
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Primero necesitamos verificar tu ubicación para confirmar que hay un incendio activo cerca de ti.
              </p>
              <button
                type="button"
                onClick={verificarUbicacion}
                disabled={cargando}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {cargando ? 'Verificando ubicación...' : '📍 Verificar mi ubicación'}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-semibold">✓ Incendio activo detectado cerca de tu ubicación</p>
              <p className="text-xs mt-1">📍 Tu ubicación: {direccionUsuario}</p>
              <p className="text-xs mt-0.5">🔥 Incendio: {incendioCercano?.tipoIncendio} — Estado: {incendioCercano?.estado}</p>
            </div>
          )}

          {/* Paso 2 — formulario, solo si ubicación verificada */}
          {ubicacionVerificada && (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <p className="text-sm font-semibold text-slate-700">Paso 2 — Completa tu información</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#C82323]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Teléfono</label>
                  <input
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#C82323]"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-700">¿Cuál es tu situación?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(ESTADOS).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, estado: key }))}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        formData.estado === key ? config.activo : config.color
                      }`}
                    >
                      <p className="font-bold">{config.label}</p>
                      <p className="mt-1 text-sm opacity-90">{config.descripcion}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  name="mensaje"
                  rows={3}
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Detalla tu situación, número de personas contigo, etc."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#C82323]"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-lg bg-[#C82323] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a31d1d] disabled:opacity-50 sm:w-auto"
              >
                {cargando ? 'Enviando...' : 'Enviar confirmación'}
              </button>
            </form>
          )}

          {error && !ubicacionVerificada && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}