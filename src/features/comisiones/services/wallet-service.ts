import {
  Banco,
  DatosBancarios,
  RetiroRequest,
  Retiro,
  ComisionesPendientesResponse,
} from "../types/wallet"

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

    // ✅ CORRECCIÓN: Probablemente también están en items
    const bancos = data?.data?.bancos || []

    console.log("✅ Bancos extraídos:", bancos, "Total:", bancos.length)

    return Array.isArray(bancos) ? bancos : []
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

    // ✅ Si no hay datos bancarios configurados, devolver null
    return data?.data || null
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

    // 🔍 NUEVO: Ver el JSON exacto que se envía
    console.log("📦 JSON.stringify:", JSON.stringify(retiroData))

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

      // 🔍 MOSTRAR TODO EL ERROR
      console.error("❌ Error POST Retiro:", errorData)
      console.error("❌ Status:", response.status)
      console.error("❌ StatusText:", response.statusText)
      console.table(errorData) // 👈 Esto mostrará el objeto en tabla

      throw new Error(
        errorData.message || `Error al procesar retiro: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log("✅ Retiro procesado:", data)
    return data.data || data
  },

  /**
   * GET - Obtener saldo de la wallet
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getSaldo(): Promise<any> {
    const token = getAuthToken()

    console.log("💰 GET Saldo")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log("📍 URL:", `${API_BASE_URL}/apa/wallet/saldo`)

    const response = await fetch(`${API_BASE_URL}/apa/wallet/saldo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    })

    console.log("📡 Status GET Saldo:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET Saldo:", errorData)
      throw new Error(
        errorData.message || `Error al obtener saldo: ${response.statusText}`
      )
    }

    const data = await response.json()

    // 🔍 LOGS DETALLADOS
    console.log("=".repeat(50))
    console.log("✅ RESPUESTA COMPLETA DEL BACKEND:")
    console.log(JSON.stringify(data, null, 2))
    console.log("=".repeat(50))
    console.log("🔍 data.ok:", data.ok)
    console.log("🔍 data.data:", data.data)
    console.log("🔍 data.data.saldoGanado:", data.data?.saldoGanado)
    console.log("🔍 data.data.puedeRetirar:", data.data?.puedeRetirar)
    console.log("=".repeat(50))

    return (
      data?.data || {
        saldoTotal: 0,
        saldoGanado: 0,
        saldoRecargado: 0,
        puedeRetirar: false,
        montoMinimoRetiro: 5,
      }
    )
  },

  /**
   * GET - Ver comisiones admin pendientes de acreditar (Admin)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * GET - Ver comisiones admin pendientes de acreditar (Admin)
   */
  async getComisionesPendientes(): Promise<ComisionesPendientesResponse> {
    const token = getAuthToken()

    console.log("💰 GET Comisiones Pendientes (Admin)")
    console.log("🔑 Token:", token ? "Existe ✅" : "No existe ❌")
    console.log(
      "📍 URL:",
      `${API_BASE_URL}/apa/wallet/admin/comisiones-pendientes`
    )

    const response = await fetch(
      `${API_BASE_URL}/apa/wallet/admin/comisiones-pendientes`,
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
      "📡 Status GET Comisiones:",
      response.status,
      response.statusText
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ Error GET Comisiones:", errorData)
      throw new Error(
        errorData.message ||
          `Error al obtener comisiones: ${response.statusText}`
      )
    }

    const data = await response.json()

    console.log("=".repeat(50))
    console.log("✅ RESPUESTA COMISIONES PENDIENTES:")
    console.log(JSON.stringify(data, null, 2))
    console.log("=".repeat(50))

    return (
      data?.data || {
        admin: {
          uid: "",
          nombre: "",
          email: "",
          saldoActual: 0,
        },
        totalPendiente: 0,
        cantidadComisiones: 0,
        comisiones: [],
      }
    )
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

    // ✅ CORRECCIÓN: Los retiros están en data.data.items
    const retiros = data?.data?.items || []

    console.log("✅ Retiros extraídos:", retiros, "Total:", retiros.length)

    return Array.isArray(retiros) ? retiros : []
  },
}
