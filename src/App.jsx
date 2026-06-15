import Header from './Components/Heder'
import Hero from './Components/Hero'
import Footer from './Components/Footer'
import Login from './Components/Login'
import Register from './Components/Register'
import { Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import MapaTiempoReal from './Components/MapaTiempoReal'
import Alertas from './Components/Alertas'
import ReportarIncendio from './Components/ReportarIncendio'
import Historial from './Components/Historial'
import Dashboard from './Components/Dashboard'
import EstoyBien from './Components/EstoyBien'

function RutaAdmin({ children }) {
  const rol = localStorage.getItem('rol')
  if (rol !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <Header />
            <Hero />
            <Footer />
          </div>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route
        path="/reportar"
        element={
          <div>
            <Header />
            <ReportarIncendio />
            <Footer />
          </div>
        }
      />
      <Route
        path="/alertas"
        element={
          <div>
            <Header />
            <Alertas />
            <Footer />
          </div>
        }
      />
      <Route
        path="/mapa"
        element={
          <div>
            <Header />
            <MapaTiempoReal />
          </div>
        }
      />
      <Route
        path="/historial"
        element={
          <div>
            <Header />
            <Historial />
            <Footer />
          </div>
        }
      />
      <Route
        path="/estoy-bien"
        element={
          <div>
            <Header />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <EstoyBien />
            </div>
            <Footer />
          </div>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RutaAdmin>
            <Dashboard />
          </RutaAdmin>
        }
      />
    </Routes>
  )
}

export default App