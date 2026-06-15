import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [rol, setRol] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const guardado = localStorage.getItem('usuario')
    const rolGuardado = localStorage.getItem('rol')
    if (guardado) setUsuario(guardado)
    if (rolGuardado) setRol(rolGuardado)
  }, [])

  const handleCerrarSesion = () => {
    localStorage.clear()
    setUsuario(null)
    setRol(null)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-[#790C0B] text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="leading-tight">
          <p className="text-2xl font-bold">Municipalidad</p>
          <p className="text-2xl font-bold">Valle del Sol</p>
        </div>

        <p className="text-3xl font-bold text-white">Plataforma de Prevención de Incendios</p>

        <div className="relative flex items-center gap-3">
          <Link
            to="/alertas"
            aria-label="Alertas"
            title="Alertas"
            className="inline-flex items-center rounded-full p-3 transition-colors hover:bg-white/10 hover:text-yellow-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-9 w-9"
            >
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
              <circle cx="18.5" cy="4.8" r="3.1" fill="#FACC15" stroke="none" />
              <line x1="18.5" y1="3.3" x2="18.5" y2="5.5" stroke="#790C0B" />
              <circle cx="18.5" cy="6.5" r="0.55" fill="#790C0B" stroke="none" />
            </svg>
          </Link>

          {usuario ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
                </svg>
                <span className="max-w-[140px] truncate">{usuario}</span>
                {rol && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${rol === 'ADMIN' ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>
                    {rol}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-white/20 bg-[#5a0909] shadow-lg">
                  <div className="border-b border-white/10 px-4 py-2">
                    <p className="text-xs text-white/60">Sesión iniciada como</p>
                    <p className="truncate text-sm font-semibold text-white">{usuario}</p>
                    {rol && <p className="text-xs text-yellow-300">{rol}</p>}
                  </div>
                  {rol === 'ADMIN' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                      </svg>
                      Panel de Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleCerrarSesion}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md border border-black/50 bg-[#cf0000] px-15 py-3 text-xs font-semibold transition-colors hover:bg-[#a5100d]"
            >
              Iniciar Sesion
            </Link>
          )}
        </div>
      </div>

      <nav className="border-t border-[#820E0D] bg-[#A80000] px-4 py-2 sm:px-6 flex justify-center gap-x-6 gap-y-2 text-lg font-medium">
        <Link to="/" className="hover:text-yellow-200 transition-colors">Inicio</Link>
        <Link to="/mapa" className="hover:text-yellow-200 transition-colors">Mapa en Tiempo Real</Link>
        <Link to="/reportar" className="hover:text-yellow-200 transition-colors">Reportar Incendio</Link>
        <Link to="/historial" className="hover:text-yellow-200 transition-colors">Historial</Link>
        <Link to="/estoy-bien" className="hover:text-yellow-200 transition-colors">Sistema Estoy Bien</Link>
        <a href="#Contacto" className="hover:text-yellow-200 transition-colors">Contacto</a>
      </nav>
    </header>
  )
}