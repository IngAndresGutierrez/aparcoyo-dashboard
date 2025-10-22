// hooks/useGetAllReservas.ts
import { useState, useEffect, useCallback } from "react"

import { getAllReservasService } from "../services/reservas"
import { ReservaTable } from "../types"

interface UseGetAllReservasOptions {
  autoFetch?: boolean
  refetchInterval?: number // en milisegundos
}

export const useGetAllReservas = (options: UseGetAllReservasOptions = {}) => {
  const { autoFetch = false, refetchInterval = 0 } = options

  const [reservas, setReservas] = useState<ReservaTable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAllReservas = useCallback(async (skipCache = false) => {
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

      // Agregar timestamp para evitar caché del navegador/backend
      const response = await getAllReservasService(
        skipCache ? Date.now() : undefined
      )

      console.log("✅ Respuesta completa:", response)
      console.log("✅ Datos recibidos:", response.data)

      // Ajustar según la estructura real de la respuesta
      const reservasData = response.data.data || response.data || []

      // 👇 Ordenar por fechaInicio descendente (más recientes primero)
      const reservasOrdenadas = [...reservasData].sort((a, b) => {
        const fechaA = new Date(a.fechaInicio).getTime()
        const fechaB = new Date(b.fechaInicio).getTime()
        return fechaB - fechaA // Más recientes primero
      })

      console.log("📋 Reservas procesadas y ordenadas:", {
        total: reservasOrdenadas.length,
        primera: reservasOrdenadas[0],
        primeraFecha: reservasOrdenadas[0]?.fechaInicio,
        ultima: reservasOrdenadas[reservasOrdenadas.length - 1],
        ultimaFecha:
          reservasOrdenadas[reservasOrdenadas.length - 1]?.fechaInicio,
      })

      setReservas(reservasOrdenadas)
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
  }, [])

  // Auto-fetch al montar si está habilitado
  useEffect(() => {
    if (autoFetch) {
      getAllReservas(true) // Skipear caché en la carga inicial
    }
  }, [autoFetch, getAllReservas])

  // Auto-refresh si está configurado
  useEffect(() => {
    if (refetchInterval > 0) {
      console.log(`🔄 Auto-refresh configurado cada ${refetchInterval / 1000}s`)

      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh ejecutándose...")
        getAllReservas(true) // Skipear caché en auto-refresh
      }, refetchInterval)

      return () => {
        console.log("🛑 Limpiando auto-refresh")
        clearInterval(interval)
      }
    }
  }, [refetchInterval, getAllReservas])

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
