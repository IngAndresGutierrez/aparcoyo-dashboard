import {
  ActualizarComisionesPayload,
  ConfiguracionComisiones,
} from "../types/comisiones"

const API_BASE_URL = "https://kns.aparcoyo.com"

// Función auxiliar para obtener el token (ajusta según tu implementación)
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  // Ajusta esto según donde guardes tu token
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

export const comisionesService = {
  /**
   * GET - Obtener configuración de comisiones
   */
  async obtenerConfiguracion(): Promise<ConfiguracionComisiones> {
    const token = getAuthToken()

    console.log("🔍 GET Configuración")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/pagos/configuracion-comisiones`)

    const response = await fetch(
      `${API_BASE_URL}/apa/pagos/configuracion-comisiones`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        cache: "no-store", // Para Next.js - siempre obtiene datos frescos
      }
    )

    console.log("📡 Status GET:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET:", errorData)
      throw new Error(
        errorData.message ||
          `Error al obtener configuración: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Datos recibidos GET:", data)
    return data.data || data // Adapta según la estructura de respuesta de tu API
  },

  /**
   * PATCH - Actualizar configuración de comisiones
   */
  async actualizarConfiguracion(
    payload: ActualizarComisionesPayload
  ): Promise<ConfiguracionComisiones> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/apa/pagos/configuracion-comisiones`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      }
    )

    console.log("📡 Status PATCH:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error PATCH:", errorData)
      throw new Error(
        errorData.message ||
          `Error al actualizar configuración: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Datos recibidos PATCH:", data)
    return data.data || data // Adapta según la estructura de respuesta de tu API
  },
}
