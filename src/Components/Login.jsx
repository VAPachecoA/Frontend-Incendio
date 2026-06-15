// src/Components/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState({ text: '', type: '' }) // type: 'success' | 'error'

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiMessage({ text: '', type: '' })
  }

  const validate = () => {
    const nextErrors = {}
    if (!formData.email.trim()) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Ingresa un correo válido.'
    }
    if (!formData.password) {
      nextErrors.password = 'Ingresa tu contraseña.'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiMessage({ text: '', type: '' })

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      const message = await iniciarSesion(formData.email.trim(), formData.password)

      // El backend devuelve "Inicio de Sesion correcto" o "Credenciales Incorrectas"
      if (message.startsWith('OK:')) {
        const [, rol, nombre] = message.split(':')
        localStorage.setItem('usuario', formData.email.trim())
        localStorage.setItem('rol', rol)
        localStorage.setItem('nombre', nombre)
        setApiMessage({ text: '¡Bienvenido! Redirigiendo...', type: 'success' })
        setTimeout(() => navigate(rol === 'ADMIN' ? '/dashboard' : '/'), 1500)
      } else {
        setApiMessage({ text: 'Correo o contraseña incorrectos.', type: 'error' })
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
        <div className="w-full max-w-md rounded-xl bg-white p-7 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-[#1f2937] flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#b80d0d]" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5l-8-3Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 12.2c-2.5-.9-4.5-2.7-5.7-5 .9-1.4 2.5-2.2 4.2-2.2h3c1.8 0 3.4.8 4.2 2.2-1.2 2.3-3.2 4.1-5.7 5Z" />
            </svg>
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">Accede a tu cuenta para continuar</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Correo */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                Correo Electrónico
              </label>
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
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                id="password" name="password" type="password" placeholder="Tu contraseña"
                value={formData.password} onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#b80d0d]"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox" name="remember"
                  checked={formData.remember} onChange={handleChange}
                  className="accent-[#b80d0d]"
                />
                Recordarme
              </label>
              <a href="#" className="text-[#1d4ed8] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
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
                  Ingresando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
                  </svg>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-[#1d4ed8] hover:underline">
              Regístrate aquí
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