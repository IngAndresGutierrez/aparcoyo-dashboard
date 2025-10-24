// services/reservas.ts
import axios from "axios"

import { EstadisticasReservasResponse } from "../types/reservas-range"
import { ReservasTableResponse } from "../types"

const BASE_URL = "https://kns.aparcoyo.com/apa/reservas"

// Tipo para la respuesta completa del API
interface ApiResponse {
  ok: boolean
  data: EstadisticasReservasResponse
  msg: string
}

// ✅ Servicio para obtener todas las reservas (TABLA) - Opción original
export const getAllReservasService = async (timestamp?: number) => {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  console.log("🔄 Llamando al servicio de reservas para tabla:", BASE_URL)

  try {
    const response = await axios.get<ReservasTableResponse>(`${BASE_URL}`, {
      params: timestamp ? { _t: timestamp } : {},
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    console.log("✅ Reservas recibidas:", {
      total: response.data.data?.length || 0,
      estructura: response.data,
    })

    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Error obteniendo reservas:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: BASE_URL,
      })
    }
    throw error
  }
}

// ✅ NUEVO: Servicio para obtener reservas de una plaza específica
export const getReservasByPlazaService = async (
  plazaId: string,
  timestamp?: number
) => {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const url = `${BASE_URL}/plaza/${plazaId}`
  console.log(`🔄 Llamando al servicio de reservas para plaza ${plazaId}:`, url)

  try {
    const response = await axios.get<ReservasTableResponse>(url, {
      params: timestamp ? { _t: timestamp } : {},
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    console.log(`✅ Reservas recibidas para plaza ${plazaId}:`, {
      total: response.data.data?.length || 0,
      estructura: response.data,
    })

    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error obteniendo reservas de plaza ${plazaId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url,
      })
    }
    throw error
  }
}

// ✅ Servicio para estadísticas (GRÁFICAS)
export const getReservasStatsByRangeService = async (
  rango: "dia" | "semana" | "mes",
  signal?: AbortSignal
) => {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const url = `${BASE_URL}/estadisticas`
  console.log(
    `🔄 Llamando al servicio de reservas estadísticas: ${url}?rango=${rango}`
  )

  try {
    const response = await axios.get<ApiResponse>(url, {
      params: { rango },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal,
    })

    console.log(`✅ Datos recibidos del servicio de reservas estadísticas:`, {
      rango,
      totalReservas: response.data.data.reservasTotal || 0,
      estructura: response.data,
    })

    return response
  } catch (error) {
    // Si la petición fue cancelada
    if (axios.isCancel(error)) {
      console.log(
        `🚫 Petición de reservas estadísticas cancelada para rango: ${rango}`
      )
      throw error
    }

    if (axios.isAxiosError(error)) {
      console.error(`❌ Error en getReservasStatsByRangeService:`, {
        rango,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url,
      })
    }

    throw error
  }
}
