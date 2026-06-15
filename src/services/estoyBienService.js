const API_BASE = 'http://localhost:8083/apireporte/estoy-bien'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const RADIO_KM = 5 // radio máximo para considerar que estás cerca de un incendio

export async function obtenerDireccion(lat, lng) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=es&access_token=${MAPBOX_TOKEN}`
    )
    const data = await res.json()
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
    return `${lat}, ${lng}`
  } catch {
    return `${lat}, ${lng}`
  }
}

function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function verificarProximidadIncendio(latUsuario, lngUsuario) {
  try {
    const res = await fetch('http://localhost:8083/apireporte/reportes')
    const reportes = await res.json()
    const activos = reportes.filter((r) => r.estado !== 'CERRADO')
    const cercano = activos.find((r) =>
      calcularDistanciaKm(latUsuario, lngUsuario, r.latitud, r.longitud) <= RADIO_KM
    )
    return cercano || null
  } catch {
    return null
  }
}

export async function registrarRespuesta({ nombre, telefono, estado, mensaje, usuario, latitud, longitud, idReporte, direccion }) {
  const response = await fetch(`${API_BASE}/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombreUsuario: nombre,
      telefono,
      estado,
      mensaje,
      correoUsuario: usuario,
      latitud: latitud || null,
      longitud: longitud || null,
      idReporte: idReporte || null,
      direccion: direccion || null,
    }),
  })
  if (!response.ok) throw new Error('Error al registrar estado')
  return response.json()
}

export async function obtenerTodas() {
  const response = await fetch(`${API_BASE}/todos`)
  if (!response.ok) throw new Error('Error al obtener respuestas')
  return response.json()
}