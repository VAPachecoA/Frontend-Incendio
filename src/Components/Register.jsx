// src/Components/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../services/authService'

function validateRut(value) {
  if (value.length < 2) return false
  const body = value.slice(0, -1)
  const verifier = value.slice(-1).toUpperCase()
  let sum = 0
  let multiplier = 2
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  const expectedVerifier = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)
  return verifier === expectedVerifier
}

function normalizeRut(value) {
  return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

function normalizePhone(value) {
  return value.replace(/[^0-9+]/g, '')
}

export default function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    rut: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState({ text: '', type: '' }) // type: 'success' | 'error'

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (submitted) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setApiMessage({ text: '', type: '' })
  }

  const validate = () => {
    const nextErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Ingresa tu nombre.'
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = 'Ingresa tu apellido.'
    }

    const rutDigits = normalizeRut(formData.rut)
    if (!rutDigits) {
      nextErrors.rut = 'Ingresa tu RUT.'
    } else if (!validateRut(rutDigits)) {
      nextErrors.rut = 'El RUT no es válido.'
    }

    const normalizedPhone = normalizePhone(formData.phone)
    if (!normalizedPhone) {
      nextErrors.phone = 'Ingresa un teléfono.'
    } else if (!/^(?:\+?56)?9\d{8}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Ingresa un teléfono móvil chileno válido (ej: +56912345678).'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Ingresa un correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Ingresa un correo válido.'
    }

    if (formData.password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      nextErrors.password = 'Incluye mayúsculas, minúsculas y al menos un número.'
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    if (!formData.termsAccepted) {
      nextErrors.termsAccepted = 'Debes aceptar los términos.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setApiMessage({ text: '', type: '' })

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      const message = await registrarUsuario(formData)

      // El backend devuelve "se guardo el usuario con id: X"
      if (message.toLowerCase().includes('guardo') || message.toLowerCase().includes('guardó')) {
        setApiMessage({ text: '¡Cuenta creada con éxito! Redirigiendo al login...', type: 'success' })
        setTimeout(() => navigate('/login'), 2000)
      } else {
        // El correo ya existe u otro mensaje de negocio
        setApiMessage({ text: message, type: 'error' })
      }
    } catch (error) {
      setApiMessage({ text: error.message || 'Error de conexión con el servidor.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      <header className="bg-[#990b0b] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-bold sm:text-base">MUNICIPALIDAD VALLE DEL SOL</p>
            <p className="text-xs text-white/90 sm:text-sm">Plataforma de Prevención de Incendios</p>
          </div>
          <Link
            to="/"
            className="rounded-md border border-black/50 bg-[#cf0000] px-5 py-2 text-xs font-semibold transition-colors hover:bg-[#a5100d] sm:text-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-xl bg-white p-7 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-[#1f2937] flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#b80d0d]" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
            </svg>
            Crear Cuenta
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">Únete a la plataforma de prevención</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">Nombre</label>
                <input
                  id="name" name="name" type="text" placeholder="Juan"
                  value={formData.name} onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Apellido */}
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-semibold text-gray-700">Apellido</label>
                <input
                  id="lastName" name="lastName" type="text" placeholder="Pérez"
                  value={formData.lastName} onChange={handleChange}
                  aria-invalid={Boolean(errors.lastName)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>

              {/* RUT */}
              <div>
                <label htmlFor="rut" className="mb-1 block text-sm font-semibold text-gray-700">RUT</label>
                <input
                  id="rut" name="rut" type="text" placeholder="12345678-9"
                  value={formData.rut} onChange={handleChange}
                  aria-invalid={Boolean(errors.rut)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.rut && <p className="mt-1 text-xs text-red-600">{errors.rut}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-gray-700">Teléfono</label>
                <input
                  id="phone" name="phone" type="tel" placeholder="+56912345678"
                  value={formData.phone} onChange={handleChange}
                  aria-invalid={Boolean(errors.phone)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                <input
                  id="email" name="email" type="email" placeholder="tu@email.com"
                  value={formData.email} onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">Contraseña</label>
                <input
                  id="password" name="password" type="password" placeholder="Mínimo 8 caracteres"
                  value={formData.password} onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold text-gray-700">Confirmar Contraseña</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password" placeholder="Repite la contraseña"
                value={formData.confirmPassword} onChange={handleChange}
                aria-invalid={Boolean(errors.confirmPassword)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Términos */}
            <div>
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  name="termsAccepted" type="checkbox"
                  checked={formData.termsAccepted} onChange={handleChange}
                  className="mt-1 accent-[#b80d0d]"
                />
                <span>
                  Acepto los{' '}
                  <a href="#" className="font-semibold text-[#1d4ed8] hover:underline">Términos de Uso</a>
                  {' '}y la{' '}
                  <a href="#" className="font-semibold text-[#1d4ed8] hover:underline">Política de Privacidad</a>
                </span>
              </label>
              {errors.termsAccepted && <p className="mt-1 text-xs text-red-600">{errors.termsAccepted}</p>}
            </div>

            {/* Mensaje de la API */}
            {apiMessage.text && (
              <p
                aria-live="polite"
                className={`rounded-md px-3 py-2 text-sm ${
                  apiMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {apiMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#b80d0d] py-2.5 text-sm font-semibold text-white shadow hover:bg-[#960909] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-[#1d4ed8] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-[#990b0b] text-white text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <p>© 2026 Municipalidad de Valle del Sol - Plataforma de Prevención de Incendios</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-yellow-200">Términos de Uso</a>
            <a href="#" className="hover:text-yellow-200">Privacidad</a>
            <span>Emergencias: 112</span>
          </div>
        </div>
      </footer>
    </div>
  )
}