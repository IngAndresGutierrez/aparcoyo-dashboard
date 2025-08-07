// hooks/useGetAllReservas.ts
import { useState } from "react"

import { getAllReservasService } from "../services/reservas"
import { ReservaTable } from "../types"

export const useGetAllReservas = () => {
  const [reservas, setReservas] = useState<ReservaTable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAllReservas = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Verificar que hay token
      const token = localStorage.getItem("token")
      if (!token) {
        const errorMsg = "No hay token de autenticación"
        console.error("❌", errorMsg)
        setError(errorMsg)
        return
      }

      console.log("🔄 Obteniendo todas las reservas para tabla...")

      const response = await getAllReservasService()

      console.log("✅ Respuesta completa:", response)
      console.log("✅ Datos recibidos:", response.data)

      // Ajustar según la estructura real de la respuesta
      const reservasData = response.data.data || response.data || []

      console.log("📋 Reservas procesadas:", {
        total: reservasData.length,
        primera: reservasData[0],
      })

      setReservas(reservasData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error obteniendo reservas:", error)

      let errorMessage = "Error al obtener las reservas"

      // Si es error 401, el token puede estar expirado
      if (error?.response?.status === 401) {
        errorMessage = "Token inválido o expirado"
        console.error("🔐 Token inválido o expirado")
        localStorage.removeItem("token") // Limpia el token inválido
      } else if (error?.response?.status === 404) {
        errorMessage = "Endpoint no encontrado"
      } else if (error?.response?.status === 500) {
        errorMessage = "Error interno del servidor"
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setReservas([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getAllReservas,
    reservas,
    isLoading,
    error,
    // Helpers adicionales
    totalReservas: reservas.length,
    hasReservas: reservas.length > 0,
  }
}
