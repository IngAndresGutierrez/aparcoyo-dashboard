// services/vehiculosService.ts

import { APIError, CreateVehiculoRequest, UpdateVehiculoRequest, VehiculoResponse, VehiculosFilters, VehiculosResponse } from "../types/edit-vehicle"



const API_BASE_URL = 'https://aparcoyo-back.onrender.com/apa'

class VehiculosService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      const error: APIError = {
        message: errorData.message || `Error ${response.status}`,
        status: response.status,
        field: errorData.field
      }
      throw error
    }
    return response.json()
  }

  // Obtener todos los vehículos del usuario autenticado
  async getVehiculos(filters?: VehiculosFilters): Promise<VehiculosResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.marca) queryParams.append('marca', filters.marca)
      if (filters?.tipoVehiculo) queryParams.append('tipoVehiculo', filters.tipoVehiculo)
      if (filters?.año) queryParams.append('año', filters.año.toString())
      if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString())
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.limit) queryParams.append('limit', filters.limit.toString())

      const url = `${API_BASE_URL}/vehiculos${queryParams.toString() ? `?${queryParams}` : ''}`
      
      console.log(`📡 Obteniendo vehículos: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      console.log('✅ Vehículos obtenidos:', data)
      return data
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error)
      throw error
    }
  }

  // Obtener vehículos de un usuario específico (admin only)
  async getVehiculosByUserId(userId: string, filters?: VehiculosFilters): Promise<VehiculosResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.marca) queryParams.append('marca', filters.marca)
      if (filters?.tipoVehiculo) queryParams.append('tipoVehiculo', filters.tipoVehiculo)
      if (filters?.año) queryParams.append('año', filters.año.toString())
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.limit) queryParams.append('limit', filters.limit.toString())

      const url = `${API_BASE_URL}/vehiculos/admin/${userId}${queryParams.toString() ? `?${queryParams}` : ''}`
      
      console.log(`📡 Obteniendo vehículos del usuario ${userId}: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      console.log('✅ Vehículos del usuario obtenidos:', data)
      return data
    } catch (error) {
      console.error('❌ Error al obtener vehículos del usuario:', error)
      throw error
    }
  }

  // Obtener un vehículo específico
  async getVehiculoById(vehiculoId: string): Promise<VehiculoResponse> {
    try {
      console.log(`📡 Obteniendo vehículo ${vehiculoId}...`)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      console.log('✅ Vehículo obtenido:', data)
      return data
    } catch (error) {
      console.error('❌ Error al obtener vehículo:', error)
      throw error
    }
  }

  // Crear nuevo vehículo
  async createVehiculo(vehiculoData: CreateVehiculoRequest): Promise<VehiculoResponse> {
    try {
      console.log('📡 Creando nuevo vehículo...', vehiculoData)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData)
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      console.log('✅ Vehículo creado:', data)
      return data
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error)
      throw error
    }
  }

  // Actualizar vehículo del usuario autenticado
  async updateVehiculo(vehiculoId: string, vehiculoData: UpdateVehiculoRequest): Promise<VehiculoResponse> {
    try {
      console.log(`📡 Actualizando vehículo ${vehiculoId}...`, vehiculoData)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData)
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      console.log('✅ Vehículo actualizado:', data)
      return data
    } catch (error) {
      console.error('❌ Error al actualizar vehículo:', error)
      throw error
    }
  }

  // Actualizar vehículo de usuario específico (admin only)
  async updateVehiculoAdmin(userId: string, vehiculoId: string, vehiculoData: UpdateVehiculoRequest): Promise<VehiculoResponse> {
    try {
      console.log(`📡 Admin actualizando vehículo ${vehiculoId} del usuario ${userId}...`, vehiculoData)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos/admin/${userId}/${vehiculoId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData)
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      console.log('✅ Vehículo actualizado por admin:', data)
      return data
    } catch (error) {
      console.error('❌ Error al actualizar vehículo (admin):', error)
      throw error
    }
  }

  // Eliminar vehículo del usuario autenticado
  async deleteVehiculo(vehiculoId: string): Promise<{ message: string }> {
    try {
      console.log(`📡 Eliminando vehículo ${vehiculoId}...`)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      const data = await this.handleResponse<{ message: string }>(response)
      console.log('✅ Vehículo eliminado:', data)
      return data
    } catch (error) {
      console.error('❌ Error al eliminar vehículo:', error)
      throw error
    }
  }

  // Eliminar vehículo de usuario específico (admin only)
  async deleteVehiculoAdmin(userId: string, vehiculoId: string): Promise<{ message: string }> {
    try {
      console.log(`📡 Admin eliminando vehículo ${vehiculoId} del usuario ${userId}...`)
      
      const response = await fetch(`${API_BASE_URL}/vehiculos/admin/${userId}/${vehiculoId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      const data = await this.handleResponse<{ message: string }>(response)
      console.log('✅ Vehículo eliminado por admin:', data)
      return data
    } catch (error) {
      console.error('❌ Error al eliminar vehículo (admin):', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const vehiculosService = new VehiculosService()
export default vehiculosService