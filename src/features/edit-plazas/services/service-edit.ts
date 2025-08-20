// services/modal-plaza.service.ts
// Servicio para el modal de edición de plazas

import { PlazaModal, PlazaModalError, ActualizarPlazaModal } from "../types/edit-plazas"

// ✅ Configuración para tu backend real
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aparcoyo-back.onrender.com'

// Headers básicos
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Agregar token de autenticación si existe
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Función para obtener token
function getAuthToken(): string | null {
  // Opción 1: Desde localStorage
  return localStorage.getItem('authToken') || localStorage.getItem('token') || null
  
  // Opción 2: Desde cookies (si usas cookies)
  // return document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1] || null
}

export const modalPlazaService = {
  /**
   * Obtener datos de una plaza específica
   */
  async obtenerPlaza(id: string): Promise<PlazaModal> {
    try {
      // 🔧 CAMBIO: /api/ → /apa/
      const url = `${API_BASE_URL}/apa/plazas/${id}`
      console.log(`🔄 Obteniendo plaza: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      })

      console.log(`📡 Respuesta del servidor:`, response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        
        try {
          const errorData: PlazaModalError = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no puede parsear el JSON, usar mensaje por defecto
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json() // ✅ Sin tipar estricto aquí
      const data = result.data || result // Flexible para diferentes formatos de respuesta
      
      console.log(`✅ Datos recibidos:`, data)

      // ✅ Mapear y validar los datos - CORREGIDO
      const plazaData: PlazaModal = {
        id: data.id || id,
        titulo: data.titulo || data.nombre || 'Sin título',
        descripcion: data.descripcion || '',
        precio: Number(data.precio) || 0,
        propietario: {
          // ✅ CORREGIDO: Manejo seguro del ID del propietario
          id: data.propietario?.id || data.propietarioId || '',
          // ✅ SOLO usar .nombre
          nombre: data.propietario?.nombre || 'Sin nombre',
          email: data.propietario?.email || 'sin-email@ejemplo.com'
        }
      }

      return plazaData

    } catch (error) {
      console.error('❌ Error obteniendo plaza:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error desconocido al obtener la plaza')
    }
  },

  /**
   * Actualizar datos de una plaza
   */
  async actualizarPlaza(id: string, datos: ActualizarPlazaModal): Promise<PlazaModal> {
    try {
      // 🔧 CAMBIO: /api/ → /apa/
      const url = `${API_BASE_URL}/apa/plazas/${id}`
      console.log(`🔄 Actualizando plaza: ${url}`)
      console.log(`📤 Datos a enviar:`, datos)

      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(datos),
      })

      console.log(`📡 Respuesta de actualización:`, response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        
        try {
          const errorData: PlazaModalError = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no puede parsear el JSON, usar mensaje por defecto
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json() // ✅ Sin tipar estricto aquí
      const data = result.data || result // Flexible para diferentes formatos de respuesta
      
      console.log(`✅ Plaza actualizada:`, data)

      // ✅ Mapear la respuesta actualizada - CORREGIDO
      const plazaActualizada: PlazaModal = {
        id: data.id || id,
        titulo: data.titulo || data.nombre || datos.titulo,
        descripcion: data.descripcion || datos.descripcion,
        precio: Number(data.precio) || datos.precio,
        propietario: {
          // ✅ CORREGIDO: Acceso correcto al ID del propietario
          id: data.propietario?.id || datos.propietarioId,
          // ✅ SOLO usar .nombre
          nombre: data.propietario?.nombre || 'Sin nombre',
          email: data.propietario?.email || 'sin-email@ejemplo.com'
        }
      }

      return plazaActualizada

    } catch (error) {
      console.error('❌ Error actualizando plaza:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Error desconocido al actualizar la plaza')
    }
  },

  /**
   * Verificar conectividad con el backend
   */
  async verificarConexion(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/health` // Asumiendo que tienes un endpoint de health
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      })
      
      return response.ok
    } catch {
      return false
    }
  }
}

export default modalPlazaService