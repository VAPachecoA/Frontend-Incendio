// src/services/authService.js
// Centraliza todas las llamadas a la API de usuarios

const API_BASE = 'http://localhost:8081/apiuser'

/**
 * Registra un nuevo usuario en el backend.
 * @param {Object} data - Campos del formulario de registro
 * @returns {Promise<string>} Mensaje de respuesta del servidor
 */
export async function registrarUsuario(data) {
  const response = await fetch(`${API_BASE}/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: data.name.trim(),
      apellido: data.lastName.trim(),
      // En authService.js, línea del rut:
      rut: data.rut.trim(),  // ← cambiar por esto:
      rut: (() => {
        const digits = data.rut.replace(/[^0-9kK]/g, '').toUpperCase()
        return digits.slice(0, -1) + '-' + digits.slice(-1)
      })(),
      telefono: data.phone.trim(),
      correo: data.email.trim(),
      password: data.password,
      rol: 'CLIENTE',
    }),
  })

  const text = await response.text()

  // Spring puede devolver 400 con mensaje de validación
  if (!response.ok) {
    // Intentamos parsear el body como JSON (errores de @Valid)
    try {
      const json = JSON.parse(text)
      // Spring Validation devuelve un mapa de campo→mensaje
      const messages = Object.values(json).join(', ')
      throw new Error(messages || 'Error al registrar usuario.')
    } catch {
      throw new Error(text || 'Error al registrar usuario.')
    }
  }

  return text
}

/**
 * Inicia sesión con correo y contraseña.
 * @param {string} correo
 * @param {string} password
 * @returns {Promise<string>} 
 */
export async function iniciarSesion(correo, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  })

  const text = await response.text()
  if (!response.ok) throw new Error(text || 'Error al iniciar sesión.')
  return text 
}
