import heroImage from '../assets/Hero-Imagen.jpg.jpg'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative h-screen w-full ">
      <img
        src={heroImage} alt="Hero Image"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="absolute inset-0 flex justify-center items-start pt-20 px-10">
        
        <div className="max-w-2xl text-white text-center">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Protegiendo nuestro <br /> municipio contra el fuego
          </h1>

          <p className="text-gray-200 mb-6">
            sistema integral de prevención, detección y respuesta ante<br />incendios forestales y urbanos, Juntos cuidamos valle
          </p>

          <Link to="/reportar" className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold shadow-lg mx-auto inline-block">
            🚨 Reportar Incendio Ahora
          </Link>

        </div>

      </div>

      {/* Tarjetas de Advertencia */}
      <div className="absolute bottom-0 left-0 right-0 px-10 pb-15 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          
          {/* Tarjeta 1: Incendios Activos */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">🔥</span>
              <h3 className="text-gray-800 font-semibold">Incendios Activos</h3>
            </div>
            <p className="text-4xl font-bold text-red-600 mb-2">12</p>
            <p className="text-gray-600 text-sm">3 en las últimas 24 horas</p>
          </div>

          {/* Tarjeta 2: Incidentes Desarrollados */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">🚒</span>
              <h3 className="text-gray-800 font-semibold">Incidentes Desarrollados</h3>
            </div>
            <p className="text-4xl font-bold text-red-600 mb-2">24</p>
            <p className="text-gray-600 text-sm">En terreno</p>
          </div>

          {/* Tarjeta 3: Nivel de Riesgo */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-orange-400">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-gray-800 font-semibold">Nivel de Riesgo</h3>
            </div>
            <p className="text-4xl font-bold text-orange-500 mb-2">ALTO</p>
            <p className="text-gray-600 text-sm">Precaución extremadamente alta</p>
          </div>

        </div>
      </div>
    </section>
  )
}