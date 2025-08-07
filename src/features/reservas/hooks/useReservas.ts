// hooks/useReservasPlazasStats.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import { 
  EstadisticasReservasResponse, 
  PlazaMasReservada, 
  ReservaDetalle 
} from "../types/reservas-range"

// Type específico para esta gráfica
export interface PlazasChartDataPoint {
  plaza: string
  cantidad: number
  displayName: string
}

export const useReservasPlazasStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [plazasData, setPlazasData] = useState<PlazasChartDataPoint[]>([])

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para procesar datos de plazas más reservadas
  const processPlazasData = useCallback(
    (plazasMasReservadas: PlazaMasReservada[], reservasDetalle: ReservaDetalle[]): PlazasChartDataPoint[] => {
      console.log("🔍 plazasMasReservadas recibido:", plazasMasReservadas)
      console.log("🔍 reservasDetalle para backup:", reservasDetalle)

      if (!plazasMasReservadas || !Array.isArray(plazasMasReservadas)) {
        console.log("❌ plazasMasReservadas no es un array válido")
        return []
      }

      // Procesar datos ya calculados por el backend
      const plazasDataArray = plazasMasReservadas
        .map((item) => {
          const plaza = item.nombre || "Sin nombre"
          return {
            plaza: plaza,
            cantidad: item.totalReservas || 0,
            displayName: plaza.length > 15 ? plaza.slice(0, 15) + "..." : plaza,
          }
        })
        .filter((item) => item.cantidad > 0) // Solo plazas con reservas
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
        .slice(0, 10) // Top 10 plazas

      console.log("📈 Array final de plazas:", plazasDataArray)

      return plazasDataArray
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
          `✅ Respuesta del backend para plazas (${rango}):`,
          res.data
        )

        if (res.data && typeof res.data === "object") {
          // Usar plazasMasReservadas del backend
          const processedPlazasData = processPlazasData(
            res.data.plazasMasReservadas, 
            res.data.reservasDetalle
          )

          console.log(`📊 Datos de plazas procesados:`, {
            totalPlazas: processedPlazasData.length,
            topPlaza: processedPlazasData[0]?.plaza,
            topPlazaCantidad: processedPlazasData[0]?.cantidad,
          })

          setData(res.data)
          setPlazasData(processedPlazasData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setPlazasData([])
        }
      })
      .catch((err) => {
        // No mostrar error si la petición fue cancelada
        if (err.name === "AbortError") {
          console.log(`🚫 Petición de plazas cancelada para rango: ${rango}`)
          return
        }

        console.error(`❌ Error en el hook de plazas (${rango}):`, err)

        let errorMessage = "Error al obtener las estadísticas de plazas"

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
        setPlazasData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rango, processPlazasData])

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
    plazasData, // Datos procesados para el gráfico

    // Stats adicionales
    stats: data
      ? {
          totalPlazas: plazasData.length,
          topPlaza: plazasData[0]?.plaza || "N/A",
          topPlazaCantidad: plazasData[0]?.cantidad || 0,
          averageCantidad:
            plazasData.length > 0
              ? Math.round(
                  plazasData.reduce((sum, plaza) => sum + plaza.cantidad, 0) /
                    plazasData.length
                )
              : 0,
          totalReservas: plazasData.reduce((sum, plaza) => sum + plaza.cantidad, 0),
        }
      : null,
  }
}