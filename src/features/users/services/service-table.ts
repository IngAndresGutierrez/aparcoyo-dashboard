import {
  UsuariosTablaParams,
  UsuariosTablaResponse,
  UsuarioTabla,
} from "../types/table"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

export class UsuariosTablaService {
  /**
   * Obtiene el token de autenticación desde localStorage
   * @returns string | null
   */
  private static getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || localStorage.getItem("token")
    }
    return null
  }

  /**
   * Obtiene la lista de usuarios con filtros y paginación
   * @param params - Parámetros de filtrado y paginación
   * @returns Promise con la lista de usuarios
   */
  static async getUsuarios(
    params: UsuariosTablaParams = {}
  ): Promise<UsuariosTablaResponse> {
    const token = this.getAuthToken()

    // Construir query string
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())
    if (params.search) queryParams.append("search", params.search)
    if (params.estado) queryParams.append("estado", params.estado)
    if (params.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

    const url = `${API_BASE_URL}/apa/usuarios${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`

    console.log(`🔗 Obteniendo usuarios: ${url}`)
    console.log(`🔑 Token disponible: ${token ? "Sí" : "No"}`)

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      })

      console.log(`📡 Response status: ${response.status}`)

      if (response.status === 401) {
        throw new Error("No autorizado. Verifica tu token de autenticación.")
      }

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        )
      }

      const data: UsuariosTablaResponse = await response.json()

      console.log(`✅ Usuarios obtenidos:`, data)

      if (!data.ok) {
        throw new Error(data.msg || "Error al obtener usuarios")
      }

      return data
    } catch (error) {
      console.error(`❌ Error en UsuariosTablaService.getUsuarios:`, error)

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend esté corriendo en: ${API_BASE_URL}`
        )
      }

      throw error
    }
  }

  /**
   * Obtiene un usuario específico por ID
   * @param id - ID del usuario
   * @returns Promise con los datos del usuario
   */
  static async getUsuarioById(
    id: string
  ): Promise<{ ok: boolean; data: UsuarioTabla; msg: string }> {
    const token = this.getAuthToken()
    const url = `${API_BASE_URL}/apa/usuarios/${id}`

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(15000),
      })

      if (response.status === 401) {
        throw new Error("No autorizado.")
      }

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.msg || "Error al obtener usuario")
      }

      return data
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${id}:`, error)
      throw error
    }
  }
}
