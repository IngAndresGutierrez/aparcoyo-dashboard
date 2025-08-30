// hooks/useReservasEstadoStats.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import { ReservasChartDataPoint } from "../types/reservas-range"
import {
  EstadisticasReservasResponse,
  ReservaDetalle,
} from "../types/reservas-range"

export const useReservasEstadoStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [estadoData, setEstadoData] = useState<ReservasChartDataPoint[]>([])

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para procesar datos por estado desde reservasDetalle
  const processEstadoData = useCallback(
    (reservasDetalle: ReservaDetalle[]): ReservasChartDataPoint[] => {
      console.log("🔍 reservasDetalle recibido:", reservasDetalle)

      if (!reservasDetalle || !Array.isArray(reservasDetalle)) {
        console.log("❌ reservasDetalle no es un array válido")
        return []
      }

      // Agrupar por estado y contar
      const estadoCounts = reservasDetalle.reduce((acc, reserva) => {
        const estado = reserva.estado || "Sin estado"
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log("📊 Estados contados:", estadoCounts)

      // Mapeo de estados para mostrar nombres más amigables
      const estadoLabels: Record<string, string> = {
        pendiente: "Pendiente",
        confirmado: "Confirmado",
        confirmada: "Confirmado",
        cancelado: "Cancelado",
        cancelada: "Cancelado",
        activo: "Activo",
        activa: "Activo",
        finalizado: "Finalizado",
        finalizada: "Finalizado",
      }

      // Convertir a formato del gráfico
      const estadoDataArray = Object.entries(estadoCounts)
        .map(([estado, cantidad]) => ({
          estado: estado,
          cantidad: cantidad,
          displayName:
            estadoLabels[estado.toLowerCase()] ||
            estado.charAt(0).toUpperCase() + estado.slice(1),
        }))
        .filter((item) => item.cantidad > 0) // Solo estados con reservas
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente

      console.log("📈 Array final de estados:", estadoDataArray)

      return estadoDataArray
    },
    []
  )

  // Función para hacer refetch manual
  const refetch = useCallback(() => {
    setError(null)
    setLoading(true)

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    getReservasStatsByRangeService(rango, abortControllerRef.current.signal)
      .then((res) => {
        console.log(
          `✅ Respuesta del backend para estados (${rango}):`,
          res.data
        )

        if (res.data?.data) {
          const estadisticas = res.data
            .data as unknown as EstadisticasReservasResponse
          const processedEstadoData = processEstadoData(
            estadisticas.reservasDetalle
          )

          console.log(`📊 Datos de estados procesados:`, {
            totalEstados: processedEstadoData.length,
            topEstado: processedEstadoData[0]?.estado,
            topEstadoCantidad: processedEstadoData[0]?.cantidad,
          })

          setData(estadisticas)
          setEstadoData(processedEstadoData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setEstadoData([])
        }
      })
      .catch((err) => {
        // No mostrar error si la petición fue cancelada
        if (err.name === "AbortError") {
          console.log(`🚫 Petición de estados cancelada para rango: ${rango}`)
          return
        }

        console.error(`❌ Error en el hook de estados (${rango}):`, err)

        let errorMessage = "Error al obtener las estadísticas de estados"

        if (err.message?.includes("token")) {
          errorMessage = "No autorizado - verifica tu sesión"
        } else if (err.message?.includes("404")) {
          errorMessage = "Endpoint no encontrado"
        } else if (err.message?.includes("500")) {
          errorMessage = "Error interno del servidor"
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
        setData(null)
        setEstadoData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rango, processEstadoData])

  useEffect(() => {
    refetch()

    // Cleanup: cancelar petición al desmontar o cambiar rango
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  return {
    data,
    loading,
    error,
    refetch,
    estadoData, // Datos procesados para el gráfico

    // Stats adicionales basados en la respuesta real
    stats: data
      ? {
          totalEstados: estadoData.length,
          topEstado: estadoData[0]?.estado || "N/A",
          topEstadoCantidad: estadoData[0]?.cantidad || 0,
          totalReservas: estadoData.reduce(
            (sum, estado) => sum + estado.cantidad,
            0
          ),
          reservasTotal: data.reservasTotal || 0,
          reservasCanceladas: data.reservasCanceladas || 0,
          plazasConReservaActiva: data.plazasConReservaActiva || 0,
          totalDetalles: data.reservasDetalle?.length || 0,
        }
      : null,
  }
}
