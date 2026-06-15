import { useState } from 'react'
import { enviarReporte } from '../services/reporteService'
import MapaReporte from './MapaReporte'

const FIRE_TYPES = [
  { code: 'A', label: 'Tipo A', detail: 'Madera, papel, carton, tela, plastico, etc.' },
  { code: 'B', label: 'Tipo B', detail: 'Pintura, gasolina, petroleo, etc.' },
  { code: 'C', label: 'Tipo C', detail: 'Equipos o instalaciones electricas.' },
  { code: 'D', label: 'Tipo D', detail: 'Sodio, potasio, magnesio, aluminio, titanio, etc.' },
  { code: 'K', label: 'Tipo K', detail: 'Grasas y aceites de cocina.' },
]

const TREE_TYPES = [
  'Pino', 'Eucalipto', 'Quillay', 'Peumo', 'Litre',
  'Acacia', 'Alamo', 'Nativo', 'Matorral', 'Bosque mixto',
  'Plantacion joven', 'Otro',
]

const NIVEL_POR_TIPO = {
  A: 'ALTO',
  B: 'CRITICO',
  C: 'MEDIO',
  D: 'CRITICO',
  K: 'MEDIO',
}

export default function ReportarIncendio() {
  const [fireType, setFireType] = useState('A')
  const [treeType, setTreeType] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', description: '' })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [coords, setCoords] = useState(null)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setMessage({ text: '', type: '' })
  }

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files || [])
    const maxSize = 50 * 1024 * 1024
    if (files.some((f) => !(f.type.startsWith('image/') || f.type.startsWith('video/')))) {
      setErrors((prev) => ({ ...prev, files: 'Solo se permiten imagenes o videos.' }))
      return
    }
    if (files.some((f) => f.size > maxSize)) {
      setErrors((prev) => ({ ...prev, files: 'Cada archivo debe pesar maximo 50MB.' }))
      return
    }
    setUploadedFiles(files)
    setErrors((prev) => ({ ...prev, files: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (formData.name && formData.name.trim().length < 3) {
      nextErrors.name = 'Si ingresas nombre, debe tener al menos 3 caracteres.'
    }
    const phone = formData.phone.replace(/[^0-9+]/g, '')
    if (!phone) {
      nextErrors.phone = 'Ingresa un telefono de contacto.'
    } else if (!/^(?:\+?56)?9\d{8}$/.test(phone)) {
      nextErrors.phone = 'Ingresa un telefono movil chileno valido (ej: +56912345678).'
    }
    if (!formData.description.trim()) {
      nextErrors.description = 'Describe brevemente la situacion.'
    } else if (formData.description.trim().length < 20) {
      nextErrors.description = 'La descripcion debe tener al menos 20 caracteres.'
    }
    if (fireType === 'A' && !treeType) {
      nextErrors.treeType = 'Para tipo A debes seleccionar el tipo de arbol.'
    }
    if (!coords) {
      nextErrors.coords = 'Debes marcar la ubicacion del incendio en el mapa.'
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage({ text: '', type: '' })

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      const tipoFinal = fireType === 'A' && treeType
        ? `Forestal - ${treeType}`
        : fireType === 'B' ? 'Combustible'
        : fireType === 'C' ? 'Electrico'
        : fireType === 'D' ? 'Metal'
        : 'Grasa/Cocina'

      await enviarReporte({
        nombre: formData.name.trim() || null,
        telefono: formData.phone.trim(),
        tipoIncendio: tipoFinal,
        descripcion: formData.description.trim(),
        latitud: coords.lat,
        longitud: coords.lng,
        nivelGravedad: NIVEL_POR_TIPO[fireType] ?? 'MEDIO',
      })

      setMessage({ text: '¡Reporte enviado con exito! El equipo de emergencias fue notificado. Puedes ver el registro en la seccion Historial.', type: 'success' })
      setFormData({ name: '', phone: '', description: '' })
      setFireType('A')
      setTreeType('')
      setUploadedFiles([])
      setErrors({})
    } catch (err) {
      setMessage({ text: 'Error al enviar el reporte: ' + err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
          <div className="mb-4">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#b80d0d]" aria-hidden="true">
                <path d="M14.5 2.5c.5 2.1 0 3.8-1.5 5.2-.9.8-1.3 1.7-1.3 2.7 0 1.6 1.2 2.8 2.8 2.8 2.4 0 4-2.3 4-5.7 2.1 2.1 3.2 4.6 3.2 7.4 0 4.1-3.3 7.3-7.6 7.3-4.4 0-7.8-3.3-7.8-7.6 0-2.8 1.4-5.4 4.1-7.7-.1 1.2.2 2.2.9 2.9.5-.5.8-1.2.9-2.1.2-1.5.8-2.7 2-3.7.8-.7 1.4-1.4 1.8-2.2Z" />
              </svg>
              Reportar un Incendio
            </h1>
            <p className="mt-1 text-sm text-slate-600">Tu reporte es crucial para una respuesta rapida.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre (Opcional)</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b80d0d]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Telefono de Contacto</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+56 9 12345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b80d0d]"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Tipo de Incendio</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FIRE_TYPES.map((type) => (
                  <button
                    key={type.code}
                    type="button"
                    onClick={() => {
                      setFireType(type.code)
                      setMessage({ text: '', type: '' })
                      if (type.code !== 'A') {
                        setTreeType('')
                        setErrors((prev) => ({ ...prev, treeType: undefined }))
                      }
                    }}
                    className={`rounded-md border px-3 py-3 text-left transition-colors ${
                      fireType === type.code
                        ? 'border-[#b80d0d] bg-[#b80d0d] text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-sm font-bold">{type.label}</p>
                    <p className={`text-xs ${fireType === type.code ? 'text-white/90' : 'text-slate-600'}`}>{type.detail}</p>
                  </button>
                ))}
              </div>
            </div>

            {fireType === 'A' && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo de arbol</label>
                <select
                  value={treeType}
                  onChange={(e) => {
                    setTreeType(e.target.value)
                    setErrors((prev) => ({ ...prev, treeType: undefined }))
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b80d0d]"
                >
                  <option value="">Selecciona tipo de arbol</option>
                  {TREE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.treeType && <p className="mt-1 text-xs text-red-600">{errors.treeType}</p>}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Ubicacion del Incendio
              </label>
              <div className="rounded-lg border border-slate-200 p-3">
                <MapaReporte onCoordsChange={(c) => {
                  setCoords(c)
                  setErrors((prev) => ({ ...prev, coords: undefined }))
                }} />
                {errors.coords && (
                  <p className="mt-1 text-xs text-red-600">{errors.coords}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Descripcion</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe lo que ves: tamano del incendio, que se esta quemando, referencias del lugar, etc."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#b80d0d]"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Fotos o Videos (Opcional)</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-[#b80d0d] hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mb-2 h-6 w-6 text-slate-500" aria-hidden="true">
                  <path d="M16 16 12 12 8 16" /><path d="M12 12v9" />
                  <path d="M20 16.5a4.5 4.5 0 0 0-1.3-8.8A6 6 0 0 0 6.2 8.8 4 4 0 0 0 7 16.6" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Arrastra archivos aqui o haz clic para seleccionar</span>
                <span className="mt-1 text-xs text-slate-500">PNG, JPG, MP4 — Max. 50MB</span>
                <input type="file" className="hidden" multiple onChange={handleFilesChange} />
              </label>
              {uploadedFiles.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">{uploadedFiles.length} archivo(s) seleccionado(s)</p>
              )}
              {errors.files && <p className="mt-1 text-xs text-red-600">{errors.files}</p>}
            </div>

            {message.text && (
              <p
                aria-live="polite"
                className={`rounded-md px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#b80d0d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#960909] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enviando reporte...
                </>
              ) : 'Enviar Reporte'}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md">
            <h2 className="text-lg font-bold text-slate-900">Informacion Importante</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#b80d0d]">📍</span>
                <span><span className="font-semibold">Ubicacion exacta:</span> Trata de ser lo mas preciso posible con el lugar del incendio.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#b80d0d]">🔥</span>
                <span><span className="font-semibold">Que reportar:</span> Tamano aproximado, tipo de incendio, viviendas cercanas y direccion del viento.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#b80d0d]">📷</span>
                <span><span className="font-semibold">Evidencia:</span> Fotos y videos ayudan a evaluar mejor la situacion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#b80d0d]">🚨</span>
                <span><span className="font-semibold">Emergencia:</span> Si hay peligro inminente, llama al 132 primero.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center shadow-md">
            <p className="flex items-center justify-center gap-2 text-lg font-semibold text-[#b80d0d]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M2.2 5.2a2.5 2.5 0 0 1 2.7-2.1l3 .3a2.5 2.5 0 0 1 2.2 2l.5 2.3a2.5 2.5 0 0 1-.7 2.2L8.5 11.3a16.4 16.4 0 0 0 4.2 4.2l1.4-1.4a2.5 2.5 0 0 1 2.2-.7l2.3.5a2.5 2.5 0 0 1 2 2.2l.3 3a2.5 2.5 0 0 1-2.1 2.7 18.6 18.6 0 0 1-16.6-16.6Z" />
              </svg>
              Emergencias
            </p>
            <p className="text-4xl font-bold text-[#b80d0d]">132</p>
            <p className="text-sm text-slate-600">Atencion 24/7</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1475776408506-9a5371e7a068?q=80&w=1000&auto=format&fit=crop"
              alt="Brigadista combatiendo incendio"
              className="h-44 w-full object-cover"
            />
          </div>
        </aside>
      </div>
    </section>
  )
}