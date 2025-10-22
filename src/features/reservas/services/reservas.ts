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

// ✅ Servicio para obtener todas las reservas (TABLA)
export const getAllReservasService = (timestamp?: number) => {
  const token = localStorage.getItem("token")

  console.log("🔄 Llamando al servicio de reservas para tabla:", BASE_URL)

  return axios.get<ReservasTableResponse>(`${BASE_URL}`, {
    params: timestamp ? { _t: timestamp } : {}, // 👈 Agregar timestamp como query param
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // 👇 Headers para evitar caché
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}

// ✅ Servicio para estadísticas (GRÁFICAS)
export const getReservasStatsByRangeService = async (
  rango: "dia" | "semana" | "mes",
  signal?: AbortSignal
) => {
  try {
    console.log(
      `🔄 Llamando al servicio de reservas estadísticas: ${BASE_URL}/estadisticas?rango=${rango}`
    )

    // Obtener token de autenticación
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    const response = await axios.get<ApiResponse>(`${BASE_URL}/estadisticas`, {
      params: { rango }, // axios maneja los query params automáticamente
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal, // Para cancelar peticiones
    })

    console.log(`✅ Datos recibidos del servicio de reservas estadísticas:`, {
      rango,
      totalReservas: response.data.data.reservasTotal || 0,
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

    console.error(`❌ Error en getReservasStatsByRangeService:`, {
      rango,
      error: error instanceof Error ? error.message : error,
    })

    throw error
  }
}
