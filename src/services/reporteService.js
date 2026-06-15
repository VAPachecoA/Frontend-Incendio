const API_BASE = 'http://localhost:8083/apireporte'

export async function enviarReporte(data) {
  const correo = localStorage.getItem('usuario') // ← tomar del localStorage
  const response = await fetch(`${API_BASE}/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, correoUsuario: correo }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(text || 'Error al enviar el reporte.')
  return text
}