import { useState } from 'react'
import { Link } from 'react-router-dom'
import AlertaMapbox from './AlertaMapbox'
import EstoyBien from './EstoyBien'

export default function Alertas() {
  const [canalSeleccionado, setCanalSeleccionado] = useState('')

  const handleCanalClick = (canal) => {
    setCanalSeleccionado(`Canal ${canal} seleccionado: te enviaremos actualizaciones por este medio.`)
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#e6d6d6] bg-white text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between bg-[#C82323] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/10 text-xl">
              !
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">Alerta de emergencia</p>
              <h1 className="text-xl font-bold sm:text-2xl">Evacuacion inmediata</h1>
            </div>
          </div>

          <Link
            to="/mapa"
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            Ir al mapa en tiempo real
          </Link>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900 sm:text-xl">Incendio Forestal \"El Roble\" - Nivel CRITICO</p>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Sector La Montana - 2.5 hectareas afectadas</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-center">
              <p className="text-sm font-medium text-slate-600">Hora</p>
              <p className="mt-1 text-2xl font-bold text-[#8f1d1d]">15:30 hrs</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-center">
              <p className="text-sm font-medium text-slate-600">Extension</p>
              <p className="mt-1 text-2xl font-bold text-[#8f5c0a]">2.5 ha</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 px-5 py-4 text-center">
              <p className="text-sm font-medium text-slate-600">Viento</p>
              <p className="mt-1 text-2xl font-bold text-[#1f5f8f]">25 km/h</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Zonas en Evacuacion</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Una zona en evacuacion es un sector con riesgo alto de propagacion del incendio, humo denso o
                bloqueo de rutas. Si tu ubicacion esta dentro de estas areas, debes evacuar de inmediato por vias
                seguras y seguir indicaciones oficiales.
              </p>

              <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Sector La Montana</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Villa Las Palmas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Camino al Lago</span>
                </li>
              </ul>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">Recomendaciones rapidas:</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  <li>Prepara mochila de emergencia con documentos, agua y medicamentos.</li>
                  <li>Evita rutas con humo y usa solo caminos habilitados.</li>
                  <li>Apoya a ninos, adultos mayores y mascotas durante la salida.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-rose-50 to-slate-100 p-4 shadow-sm">
              <div className="flex min-h-90 flex-col gap-4 rounded-lg border border-dashed border-rose-300 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mapa de emergencia</p>
                  <Link
                    to="/mapa"
                    className="rounded-full bg-[#C82323] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#a31d1d]"
                  >
                    Ver en el Mapa
                  </Link>
                </div>

                <AlertaMapbox />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Recibir Notificaciones</h2>
              <div className="mt-4 flex gap-3">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[#C82323]"
                />
                <button
                  type="button"
                  className="rounded-lg bg-[#C82323] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a31d1d]"
                >
                  Suscribirse
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
                <button
                  type="button"
                  onClick={() => handleCanalClick('SMS')}
                  className="rounded-full bg-slate-100 px-3 py-1 font-medium transition-colors hover:bg-slate-200"
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => handleCanalClick('WhatsApp')}
                  className="rounded-full bg-slate-100 px-3 py-1 font-medium transition-colors hover:bg-slate-200"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleCanalClick('Correo')}
                  className="rounded-full bg-slate-100 px-3 py-1 font-medium transition-colors hover:bg-slate-200"
                >
                  Correo
                </button>
              </div>

              {canalSeleccionado ? (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" aria-live="polite">
                  {canalSeleccionado}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Canales Oficiales</h2>
              <div className="mt-4 space-y-3 text-sm sm:text-base">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                  <span>Radio Valle 99.5 FM</span>
                  <span className="font-semibold text-[#C82323]">99.5 FM</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                  <span>TV Local Canal 7</span>
                  <span className="font-semibold text-[#C82323]">Canal 7</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                  <span>Municipalidad</span>
                  <span className="font-semibold text-[#C82323]">www.valledelsol.gob.ar</span>
                </div>
              </div>
            </div>
          </div>

          <EstoyBien />

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Alertas Recientes</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-flex w-fit rounded-full bg-[#C82323] px-3 py-1 text-sm font-bold text-white">CRITICO</span>
              <p className="text-sm text-slate-700 sm:text-base">15:30 - Incendio \"El Roble\" - Evacuacion inmediata</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
