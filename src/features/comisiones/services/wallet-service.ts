import { Banco, DatosBancarios, RetiroRequest, Retiro } from "../types/wallet"

const API_BASE_URL = "https://kns.aparcoyo.com"

// Función auxiliar para obtener el token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

export const walletService = {
  /**
   * GET - Lista de bancos de España soportados por Stripe
   */
  async getBancos(): Promise<Banco[]> {
    const token = getAuthToken()

    console.log("🔍 GET Bancos")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/bancos`)

    const response = await fetch(`${API_BASE_URL}/apa/wallet/bancos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    })

    console.log("📡 Status GET Bancos:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET Bancos:", errorData)
      throw new Error(
        errorData.message || `Error al obtener bancos: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Bancos recibidos:", data)
    return data.data || data
  },

  /**
   * GET - Ver mis datos bancarios guardados
   */
  async getDatosBancarios(): Promise<DatosBancarios | null> {
    const token = getAuthToken()

    console.log("🔍 GET Datos Bancarios")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/datos-bancarios`)

    const response = await fetch(`${API_BASE_URL}/apa/wallet/datos-bancarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    })

    console.log("📡 Status GET Datos:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET Datos:", errorData)
      throw new Error(
        errorData.message ||
          `Error al obtener datos bancarios: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Datos bancarios recibidos:", data)
    return data.data || data
  },

  /**
   * POST - Configurar cuenta bancaria para retiros
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async configurarBanco(datos: DatosBancarios): Promise<any> {
    const token = getAuthToken()

    console.log("🔄 POST Configurar Banco")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/configurar-banco`)
    console.log("📦 Payload enviado:", datos)

    const response = await fetch(
      `${API_BASE_URL}/apa/wallet/configurar-banco`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(datos),
      }
    )

    console.log("📡 Status POST Banco:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error POST Banco:", errorData)
      throw new Error(
        errorData.message || `Error al configurar banco: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Banco configurado:", data)
    return data.data || data
  },

  /**
   * POST - Retirar fondos a cuenta bancaria
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async retirar(retiroData: RetiroRequest): Promise<any> {
    const token = getAuthToken()

    console.log("💰 POST Retirar Fondos")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/retirar`)
    console.log("📦 Payload enviado:", retiroData)

    const response = await fetch(`${API_BASE_URL}/apa/wallet/retirar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(retiroData),
    })

    console.log("📡 Status POST Retiro:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error POST Retiro:", errorData)
      throw new Error(
        errorData.message || `Error al procesar retiro: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Retiro procesado:", data)
    return data.data || data
  },

  /**
   * GET - Historial de mis retiros
   */
  async getHistorialRetiros(): Promise<Retiro[]> {
    const token = getAuthToken()

    console.log("🔍 GET Historial Retiros")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/retiros/historial`)

    const response = await fetch(
      `${API_BASE_URL}/apa/wallet/retiros/historial`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        cache: "no-store",
      }
    )

    console.log(
      "📡 Status GET Historial:",
      response.status,
      response.statusText
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET Historial:", errorData)
      throw new Error(
        errorData.message ||
          `Error al obtener historial: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Historial recibido:", data)
    return data.data || data
  },
}
