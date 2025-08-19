// services/platformStatsService.ts

import { PlatformStatsResponse } from "../types/transaction"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa"

class PlatformStatsService {
  private token: string | null = null

  // Método para establecer el token de autenticación
  setAuthToken(token: string) {
    this.token = token
    console.log("🔑 Token de autenticación establecido")
  }

  // Método para obtener el token del localStorage o donde lo guardes
  private getAuthToken(): string | null {
    if (this.token) return this.token

    // Buscar en localStorage, sessionStorage, cookies, etc.
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("authToken") ||
        sessionStorage.getItem("token")
      )
    }

    return null
  }
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const fullUrl = `${BASE_URL}${endpoint}`
    const authToken = this.getAuthToken()

    try {
      console.log("🚀 Haciendo petición a:", fullUrl)
      console.log("🔑 Token disponible:", authToken ? "SÍ" : "NO")

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      // Añadir token de autenticación si está disponible
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
        console.log("🔑 Header Authorization añadido")
      } else {
        console.warn("⚠️ No se encontró token de autenticación")
      }

      const response = await fetch(fullUrl, {
        method: "GET",
        headers,
        cache: "no-store",
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response statusText:", response.statusText)
      console.log("📡 Response ok:", response.ok)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorText = await response.text()
          console.error("❌ Error response body:", errorText)

          // Manejo específico para error 401
          if (response.status === 401) {
            throw new Error(
              "No autorizado - Verifica tu token de autenticación"
            )
          }

          if (errorText) {
            errorMessage += ` - ${errorText}`
          }
        } catch (e) {
          console.error("❌ No se pudo leer el cuerpo del error:", e)
        }

        throw new Error(errorMessage)
      }

      const rawData = await response.text()
      console.log("📦 Raw response length:", rawData.length)
      console.log("📦 Raw response preview:", rawData.slice(0, 200))

      if (!rawData) {
        throw new Error("Respuesta vacía del servidor")
      }

      try {
        const data = JSON.parse(rawData)
        console.log("✅ Parsed data keys:", Object.keys(data))
        console.log("✅ Parsed data:", data)

        if (typeof data !== "object" || data === null) {
          throw new Error("La respuesta no es un objeto JSON válido")
        }

        return data
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError)
        console.error("❌ Raw data que falló:", rawData.slice(0, 500))
        throw new Error(
          `Error parsing JSON: ${
            parseError instanceof Error ? parseError.message : "Unknown error"
          }`
        )
      }
    } catch (error) {
      console.error("❌ Error completo en makeRequest:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Error de conexión - Verifica que el servidor esté funcionando"
        )
      }

      if (error instanceof Error) {
        throw error
      }

      throw new Error("Error desconocido en la petición")
    }
  }

  async getPlatformStatistics(): Promise<PlatformStatsResponse> {
    return this.makeRequest<PlatformStatsResponse>("/pagos/platform-statistics")
  }

  // Método adicional por si necesitas estadísticas con filtros de fecha
  async getPlatformStatisticsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<PlatformStatsResponse> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    })

    return this.makeRequest<PlatformStatsResponse>(
      `/pagos/platform-statistics?${queryParams.toString()}`
    )
  }

  // Método para obtener estadísticas específicas por período
  async getPlatformStatisticsByPeriod(
    period: "daily" | "weekly" | "monthly" | "yearly"
  ): Promise<PlatformStatsResponse> {
    return this.makeRequest<PlatformStatsResponse>(
      `/pagos/platform-statistics?period=${period}`
    )
  }
}

export const platformStatsService = new PlatformStatsService()
