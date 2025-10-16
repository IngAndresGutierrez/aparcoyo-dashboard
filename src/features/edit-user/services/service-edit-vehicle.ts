// services/vehiculosService.ts - VERSIÓN LIMPIA

import { toast } from "sonner"
import {
  APIError,
  CreateVehiculoRequest,
  UpdateVehiculoRequest,
  VehiculoResponse,
  VehiculosFilters,
  VehiculosResponse,
} from "../types/edit-vehicle"

const API_BASE_URL = "https://kns.aparcoyo.com/apa"

class VehiculosService {
  private getAuthHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Error desconocido" }))

      // Solo logging en modo desarrollo
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Error del backend:", errorData.message)
        console.log("🔍 Status:", response.status)
      }

      const error: APIError = {
        message: errorData.message || `Error ${response.status}`,
        status: response.status,
        field: errorData.field,
      }

      // Manejo específico de errores con toasts
      if (response.status === 400 && Array.isArray(errorData.message)) {
        const errorMessages = errorData.message.join(", ")
        toast.error("Errores de validación", {
          description: errorMessages,
          duration: 6000,
        })
      } else if (response.status === 400) {
        toast.error("Error de validación", {
          description:
            typeof errorData.message === "string"
              ? errorData.message
              : "Datos inválidos",
          duration: 5000,
        })
      } else if (response.status >= 500) {
        toast.error("Error del servidor", {
          description: "Ha ocurrido un error interno. Intenta más tarde.",
          duration: 5000,
        })
      } else {
        toast.error("Error", {
          description: errorData.message || `Error ${response.status}`,
          duration: 5000,
        })
      }

      throw error
    }
    return response.json()
  }

  // Obtener todos los vehículos del usuario autenticado
  async getVehiculos(filters?: VehiculosFilters): Promise<VehiculosResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.search) queryParams.append("search", filters.search)
      if (filters?.marca) queryParams.append("marca", filters.marca)
      if (filters?.tipoVehiculo)
        queryParams.append("tipoVehiculo", filters.tipoVehiculo)
      if (filters?.año) queryParams.append("año", filters.año.toString())
      if (filters?.isActive !== undefined)
        queryParams.append("isActive", filters.isActive.toString())
      if (filters?.page) queryParams.append("page", filters.page.toString())
      if (filters?.limit) queryParams.append("limit", filters.limit.toString())

      const url = `${API_BASE_URL}/vehiculos${
        queryParams.toString() ? `?${queryParams}` : ""
      }`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      return data
    } catch (error) {
      // Solo re-lanzar, handleResponse ya mostró el error
      throw error
    }
  }

  // Obtener vehículos de un usuario específico (admin only)
  async getVehiculosByUserId(
    userId: string,
    filters?: VehiculosFilters
  ): Promise<VehiculosResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.search) queryParams.append("search", filters.search)
      if (filters?.marca) queryParams.append("marca", filters.marca)
      if (filters?.tipoVehiculo)
        queryParams.append("tipoVehiculo", filters.tipoVehiculo)
      if (filters?.año) queryParams.append("año", filters.año.toString())
      if (filters?.page) queryParams.append("page", filters.page.toString())
      if (filters?.limit) queryParams.append("limit", filters.limit.toString())

      const url = `${API_BASE_URL}/vehiculos/admin/${userId}${
        queryParams.toString() ? `?${queryParams}` : ""
      }`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      return data
    } catch (error) {
      throw error
    }
  }

  // Obtener un vehículo específico
  async getVehiculoById(vehiculoId: string): Promise<VehiculoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      return data
    } catch (error) {
      throw error
    }
  }

  // Crear nuevo vehículo - LIMPIO
  async createVehiculo(
    vehiculoData: CreateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      toast.loading("Creando vehículo...", { id: "create-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)

      toast.success("Vehículo creado correctamente", {
        id: "create-vehicle",
        description: "El vehículo se ha registrado exitosamente",
        duration: 4000,
      })

      return data
    } catch (error) {
      toast.dismiss("create-vehicle")
      throw error
    }
  }

  // Actualizar vehículo - LIMPIO
  async updateVehiculo(
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      toast.loading("Actualizando vehículo...", { id: "update-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)

      toast.success("Vehículo actualizado correctamente", {
        id: "update-vehicle",
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })

      return data
    } catch (error) {
      toast.dismiss("update-vehicle")
      throw error
    }
  }

  // Actualizar vehículo admin - LIMPIO
  async updateVehiculoAdmin(
    userId: string,
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      toast.loading("Actualizando vehículo...", { id: "update-vehicle-admin" })

      const response = await fetch(
        `${API_BASE_URL}/vehiculos/admin/${userId}/${vehiculoId}`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(vehiculoData),
        }
      )

      const data = await this.handleResponse<VehiculoResponse>(response)

      toast.success("Vehículo actualizado correctamente", {
        id: "update-vehicle-admin",
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })

      return data
    } catch (error) {
      toast.dismiss("update-vehicle-admin")
      throw error
    }
  }

  // Eliminar vehículo - LIMPIO
  async deleteVehiculo(vehiculoId: string): Promise<{ message: string }> {
    try {
      toast.loading("Eliminando vehículo...", { id: "delete-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<{ message: string }>(response)

      toast.success("Vehículo eliminado correctamente", {
        id: "delete-vehicle",
        description: "El vehículo se ha eliminado exitosamente",
        duration: 4000,
      })

      return data
    } catch (error) {
      toast.dismiss("delete-vehicle")
      throw error
    }
  }

  // Eliminar vehículo admin - LIMPIO
  async deleteVehiculoAdmin(
    userId: string,
    vehiculoId: string
  ): Promise<{ message: string }> {
    try {
      toast.loading("Eliminando vehículo...", { id: "delete-vehicle-admin" })

      const response = await fetch(
        `${API_BASE_URL}/vehiculos/admin/${userId}/${vehiculoId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      )

      const data = await this.handleResponse<{ message: string }>(response)

      toast.success("Vehículo eliminado correctamente", {
        id: "delete-vehicle-admin",
        description: "El vehículo se ha eliminado exitosamente",
        duration: 4000,
      })

      return data
    } catch (error) {
      toast.dismiss("delete-vehicle-admin")
      throw error
    }
  }
}

// Exportar instancia singleton
export const vehiculosService = new VehiculosService()
export default vehiculosService
