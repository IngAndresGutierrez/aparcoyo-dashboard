// services/creditos.service.ts

import {
  BalanceResponse,
  HistorialResponse,
  EditarBalanceResponse,
  EditarBalanceRequest,
} from "../types/credits-edit"

const API_BASE_URL = "https://kns.aparcoyo.com"

class CreditosService {
  private async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      // Obtener token igual que en tus otros componentes
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      console.log(`🔐 CreditosService - URL: ${url}`)
      console.log(`🔐 CreditosService - Token disponible: ${!!token}`)

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      })

      console.log(`📨 CreditosService - Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          `❌ CreditosService - Error ${response.status}:`,
          errorText
        )

        if (response.status === 401) {
          throw new Error(
            `Sin autorización para acceder a créditos. Verifica tu rol de usuario.`
          )
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ CreditosService - Datos obtenidos:`, data)

      if (!data.ok) {
        throw new Error(data.msg || "Error en la respuesta del servidor")
      }

      return data
    } catch (error) {
      console.error("❌ CreditosService - Error en la petición:", error)
      throw error
    }
  }

  /**
   * Obtener balance de créditos de un usuario por UUID (Admin)
   * GET /apa/creditos/balance/{uuid}
   */
  async obtenerBalance(uuid: string): Promise<BalanceResponse> {
    const url = `${API_BASE_URL}/apa/creditos/balance/${uuid}`
    return this.fetchWithErrorHandling<BalanceResponse>(url, {
      method: "GET",
    })
  }

  /**
   * Obtener historial de créditos de un usuario por UUID (Admin)
   * GET /apa/creditos/usuario/{uuid}
   */
  async obtenerHistorial(uuid: string): Promise<HistorialResponse> {
    const url = `${API_BASE_URL}/apa/creditos/usuario/${uuid}`
    return this.fetchWithErrorHandling<HistorialResponse>(url, {
      method: "GET",
    })
  }

  /**
   * Editar balance de créditos de un usuario por UUID (Admin)
   * PATCH /apa/creditos/editar-balance/{uuid}
   */
  async editarBalance(
    uuid: string,
    monto: number
  ): Promise<EditarBalanceResponse> {
    const url = `${API_BASE_URL}/apa/creditos/editar-balance/${uuid}`
    const body: EditarBalanceRequest = { monto }

    return this.fetchWithErrorHandling<EditarBalanceResponse>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }
}

// Exportar instancia singleton del servicio
export const creditosService = new CreditosService()

// También exportar la clase por si necesitas crear múltiples instancias
export default CreditosService
