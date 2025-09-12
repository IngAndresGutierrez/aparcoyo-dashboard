// ============================================
// 📁 services/usuariosService.ts - CORREGIDO CON FILTROS DE FECHA
// ============================================

import {
  RangoEstadisticas,
  UsuarioEstadisticasResponse,
} from "../types/graphic"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

// 🔥 NUEVA FUNCIÓN: Misma lógica que calculateDateFilters
const calculateStatsDateRange = (rango: RangoEstadisticas) => {
  const now = new Date()
  const startDate = new Date()

  switch (rango) {
    case "dia":
      startDate.setDate(now.getDate() - 7) // 7 días
      break
    case "semana":
      startDate.setDate(now.getDate() - 21) // 21 días
      break
    case "mes":
      startDate.setDate(now.getDate() - 60) // 60 días
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  return {
    fechaInicio: startDate.toISOString(),
    fechaFin: now.toISOString(),
  }
}

export class UsuariosService {
  private static getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || localStorage.getItem("token")
    }
    return null
  }

  /**
   * 🔥 MODIFICADO: Obtiene estadísticas con filtros de fecha específicos
   */
  static async getEstadisticas(
    rango: RangoEstadisticas
  ): Promise<UsuarioEstadisticasResponse> {
    // 🔥 CALCULAR fechas específicas
    const dateRange = calculateStatsDateRange(rango)

    // 🔥 CONSTRUIR URL con fechas específicas
    const url = new URL(`${API_BASE_URL}/apa/usuarios/estadisticas`)
    url.searchParams.set("rango", rango)
    url.searchParams.set("fechaInicio", dateRange.fechaInicio)
    url.searchParams.set("fechaFin", dateRange.fechaFin)

    const token = this.getAuthToken()

    console.log(`🔗 Intentando conectar a: ${url.toString()}`)
    console.log(`🔑 Token disponible: ${token ? "Sí" : "No"}`)
    console.log(`📅 Rango de fechas para stats:`, {
      rango,
      desde: new Date(dateRange.fechaInicio).toLocaleDateString("es-ES"),
      hasta: new Date(dateRange.fechaFin).toLocaleDateString("es-ES"),
    })

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), {
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

      const data: UsuarioEstadisticasResponse = await response.json()

      console.log(`✅ Datos de estadísticas recibidos:`, data)

      if (!data.ok) {
        throw new Error(data.msg || "Error al obtener estadísticas de usuarios")
      }

      return data
    } catch (error) {
      console.error(`❌ Error en UsuariosService.getEstadisticas:`, error)

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

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/apa/usuarios/estadisticas?rango=mes`,
        {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        }
      )
      return response.ok
    } catch {
      return false
    }
  }

  static getApiBaseUrl(): string {
    return API_BASE_URL
  }
}
