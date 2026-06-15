const API_BASE = 'http://localhost:8082/apihistorico'

export async function obtenerHistorial() {
  const rol = localStorage.getItem('rol')
  const correo = localStorage.getItem('usuario')

  const url = rol === 'ADMIN'
    ? `${API_BASE}/historial`
    : `${API_BASE}/historial/usuario/${correo}`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener el historial.')
  return response.json()
}

export async function guardarHistorial(data) {
  const response = await fetch(`${API_BASE}/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(text || 'Error al guardar.')
  return text
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export async function obtenerDireccion(lat, lng) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=es&access_token=${MAPBOX_TOKEN}`
    )
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
    return `${lat}, ${lng}`
  } catch {
    return `${lat}, ${lng}`
  }
}