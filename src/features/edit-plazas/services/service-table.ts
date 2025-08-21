/* eslint-disable @typescript-eslint/no-explicit-any */
// services/plazaService.ts

import { ApiError, Plaza, Reserva } from "../types/table-reservas"



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aparcoyo-back.onrender.com'

// Headers básicos - copiado del service que funciona
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

// Función para obtener token - copiado del service que funciona
function getAuthToken(): string | null {
  // Verificar si estamos en el cliente
  if (typeof window === 'undefined') return null
  
  // Opción 1: Desde localStorage - MISMO FORMATO QUE EL SERVICE QUE FUNCIONA
  return localStorage.getItem('authToken') || localStorage.getItem('token') || null
}

class PlazaService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    
    const config: RequestInit = {
      headers: {
        'Accept': '*/*',
        ...getHeaders(), // Usar la función que funciona
        ...options.headers,
      },
      ...options,
    }

    console.log(`🔄 Haciendo request a: ${API_BASE_URL}${endpoint}`)
    console.log(`📤 Headers:`, config.headers)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    console.log(`📡 Respuesta del servidor:`, response.status, response.statusText)

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: `HTTP Error: ${response.status} ${response.statusText}`,
      }))
      console.error('❌ Error de API:', errorData)
      throw errorData
    }

    const result = await response.json()
    console.log(`✅ Datos recibidos:`, result)
    return result
  }

  // Eliminar el método getAuthToken privado ya que usamos la función global

  /**
   * Obtener plaza por ID - copiando estructura del service que funciona
   */
  async getPlazaById(plazaId: string): Promise<Plaza> {
    try {
      const result = await this.makeRequest<any>(`/apa/plazas/${plazaId}`)
      const data = result.data || result // Flexible para diferentes formatos de respuesta
      
      // Mapear a nuestro tipo Plaza, adaptando desde la respuesta real
      const plaza: Plaza = {
        id: data.id || plazaId,
        nombre: data.nombre || 'Sin nombre',
        descripcion: data.descripcion || '',
        ubicacion: data.direccion || data.ubicacion || '',
        precio: data.precio || 0,
        disponible: data.disponible ?? true,
        usuarioId: data.propietario?.uid || data.usuarioId || '',
        reservas: data.reservas || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      }

      return plaza
    } catch (error) {
      console.error('❌ Error obteniendo plaza:', error)
      throw error
    }
  }

  /**
   * Obtener todas las plazas (útil para debug)
   */
  async getAllPlazas(): Promise<Plaza[]> {
    const response = await this.makeRequest<{ data: Plaza[] }>('/apa/plazas')
    return response.data
  }

  /**
   * Actualizar una reserva específica
   */
  async updateReserva(reservaId: string, updates: Partial<Reserva>): Promise<Reserva> {
    // Asumiendo que existe un endpoint para actualizar reservas
    // Si no existe, tendrás que pedirlo al backend
    const response = await this.makeRequest<{ data: Reserva }>(`/apa/reservas/${reservaId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return response.data
  }

  /**
   * Eliminar una reserva
   */
  async deleteReserva(reservaId: string): Promise<void> {
    await this.makeRequest(`/apa/reservas/${reservaId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Actualizar plaza (si necesitas esta funcionalidad)
   */
  async updatePlaza(plazaId: string, updates: Partial<Plaza>): Promise<Plaza> {
    const response = await this.makeRequest<{ data: Plaza }>(`/apa/plazas/${plazaId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return response.data
  }
}

// Instancia singleton del servicio
export const plazaService = new PlazaService()

// Funciones helper para usar directamente en los hooks
export const plazaApi = {
  getById: (id: string) => plazaService.getPlazaById(id),
  getAll: () => plazaService.getAllPlazas(),
  updateReserva: (id: string, data: Partial<Reserva>) => 
    plazaService.updateReserva(id, data),
  deleteReserva: (id: string) => plazaService.deleteReserva(id),
  updatePlaza: (id: string, data: Partial<Plaza>) => 
    plazaService.updatePlaza(id, data),
}