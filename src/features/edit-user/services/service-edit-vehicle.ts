// services/vehiculosService.ts

import { toast } from "sonner" // ✅ Agregar importación de Sonner
import {
  APIError,
  CreateVehiculoRequest,
  UpdateVehiculoRequest,
  VehiculoResponse,
  VehiculosFilters,
  VehiculosResponse,
} from "../types/edit-vehicle"

const API_BASE_URL = "https://aparcoyo-back.onrender.com/apa"

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
      console.log("🔍 Error completo del backend:", errorData)
      console.log("🔍 Status:", response.status)

      // ✅ Logging mejorado para debugging
      console.log("🔍 Error completo del backend:", errorData)
      console.log("🔍 Status:", response.status)
      console.log("🔍 URL:", response.url)

      const error: APIError = {
        message: errorData.message || `Error ${response.status}`,
        status: response.status,
        field: errorData.field,
      }

      // ✅ Manejo específico de errores 400 (validación)
      if (response.status === 400 && Array.isArray(errorData.message)) {
        console.log("🔍 Errores de validación:", errorData.message)
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

      console.log(`📡 Obteniendo vehículos: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      console.log("✅ Vehículos obtenidos:", data)
      return data
    } catch (error) {
      console.error("❌ Error al obtener vehículos:", error)
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

      console.log(`📡 Obteniendo vehículos del usuario ${userId}: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculosResponse>(response)
      console.log("✅ Vehículos del usuario obtenidos:", data)
      return data
    } catch (error) {
      console.error("❌ Error al obtener vehículos del usuario:", error)
      throw error
    }
  }

  // Obtener un vehículo específico
  async getVehiculoById(vehiculoId: string): Promise<VehiculoResponse> {
    try {
      console.log(`📡 Obteniendo vehículo ${vehiculoId}...`)

      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)
      console.log("✅ Vehículo obtenido:", data)
      return data
    } catch (error) {
      console.error("❌ Error al obtener vehículo:", error)
      throw error
    }
  }

  // Crear nuevo vehículo
  async createVehiculo(
    vehiculoData: CreateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      console.log("📡 Creando nuevo vehículo...", vehiculoData)

      // ✅ Toast de loading
      toast.loading("Creando vehículo...", { id: "create-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)

      // ✅ Toast de éxito
      toast.success("Vehículo creado correctamente", {
        id: "create-vehicle",
        description: "El vehículo se ha registrado exitosamente",
        duration: 4000,
      })

      console.log("✅ Vehículo creado:", data)
      return data
    } catch (error) {
      // ✅ Dismiss loading toast si hay error
      toast.dismiss("create-vehicle")
      console.error("❌ Error al crear vehículo:", error)
      throw error
    }
  }

  // Actualizar vehículo del usuario autenticado
  async updateVehiculo(
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      console.log(`📡 Actualizando vehículo ${vehiculoId}...`, vehiculoData)

      // ✅ Toast de loading
      toast.loading("Actualizando vehículo...", { id: "update-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(vehiculoData),
      })

      const data = await this.handleResponse<VehiculoResponse>(response)

      // ✅ Toast de éxito
      toast.success("Vehículo actualizado correctamente", {
        id: "update-vehicle",
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })

      console.log("✅ Vehículo actualizado:", data)
      return data
    } catch (error) {
      // ✅ Dismiss loading toast si hay error
      toast.dismiss("update-vehicle")
      console.error("❌ Error al actualizar vehículo:", error)
      throw error
    }
  }

  // Actualizar vehículo de usuario específico (admin only)
  async updateVehiculoAdmin(
    userId: string,
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ): Promise<VehiculoResponse> {
    try {
      console.log(
        `📡 Admin actualizando vehículo ${vehiculoId} del usuario ${userId}...`,
        vehiculoData
      )

      // ✅ Toast de loading
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

      // ✅ Toast de éxito
      toast.success("Vehículo actualizado correctamente", {
        id: "update-vehicle-admin",
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })

      console.log("✅ Vehículo actualizado por admin:", data)
      return data
    } catch (error) {
      // ✅ Dismiss loading toast si hay error
      toast.dismiss("update-vehicle-admin")
      console.error("❌ Error al actualizar vehículo (admin):", error)
      throw error
    }
  }

  // Eliminar vehículo del usuario autenticado
  async deleteVehiculo(vehiculoId: string): Promise<{ message: string }> {
    try {
      console.log(`📡 Eliminando vehículo ${vehiculoId}...`)

      // ✅ Toast de loading
      toast.loading("Eliminando vehículo...", { id: "delete-vehicle" })

      const response = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      const data = await this.handleResponse<{ message: string }>(response)

      // ✅ Toast de éxito
      toast.success("Vehículo eliminado correctamente", {
        id: "delete-vehicle",
        description: "El vehículo se ha eliminado exitosamente",
        duration: 4000,
      })

      console.log("✅ Vehículo eliminado:", data)
      return data
    } catch (error) {
      // ✅ Dismiss loading toast si hay error
      toast.dismiss("delete-vehicle")
      console.error("❌ Error al eliminar vehículo:", error)
      throw error
    }
  }

  // Eliminar vehículo de usuario específico (admin only)
  async deleteVehiculoAdmin(
    userId: string,
    vehiculoId: string
  ): Promise<{ message: string }> {
    try {
      console.log(
        `📡 Admin eliminando vehículo ${vehiculoId} del usuario ${userId}...`
      )

      // ✅ Toast de loading
      toast.loading("Eliminando vehículo...", { id: "delete-vehicle-admin" })

      const response = await fetch(
        `${API_BASE_URL}/vehiculos/admin/${userId}/${vehiculoId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      )

      const data = await this.handleResponse<{ message: string }>(response)

      // ✅ Toast de éxito
      toast.success("Vehículo eliminado correctamente", {
        id: "delete-vehicle-admin",
        description: "El vehículo se ha eliminado exitosamente",
        duration: 4000,
      })

      console.log("✅ Vehículo eliminado por admin:", data)
      return data
    } catch (error) {
      // ✅ Dismiss loading toast si hay error
      toast.dismiss("delete-vehicle-admin")
      console.error("❌ Error al eliminar vehículo (admin):", error)
      throw error
    }
  }
}

// Exportar instancia singleton
export const vehiculosService = new VehiculosService()
export default vehiculosService
