// hooks/useReservasPlazasStats.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import {
  EstadisticasReservasResponse,
  PlazaMasReservada,
  ReservaDetalle,
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
    (
      plazasMasReservadas: PlazaMasReservada[],
      reservasDetalle: ReservaDetalle[]
    ): PlazasChartDataPoint[] => {
      console.log("🔍 DATOS RECIBIDOS EN processPlazasData:")
      console.log("   plazasMasReservadas:", plazasMasReservadas)
      console.log("   tipo de plazasMasReservadas:", typeof plazasMasReservadas)
      console.log("   es array:", Array.isArray(plazasMasReservadas))
      console.log("   longitud:", plazasMasReservadas?.length)

      if (
        plazasMasReservadas &&
        Array.isArray(plazasMasReservadas) &&
        plazasMasReservadas.length > 0
      ) {
        console.log("   primer elemento:", plazasMasReservadas[0])
        console.log(
          "   estructura del primer elemento:",
          Object.keys(plazasMasReservadas[0] || {})
        )
      }

      console.log("   reservasDetalle para backup:", reservasDetalle)

      if (!plazasMasReservadas || !Array.isArray(plazasMasReservadas)) {
        console.log(
          "❌ plazasMasReservadas no es un array válido, intentando usar reservasDetalle"
        )

        // FALLBACK: Si plazasMasReservadas no está disponible, usar reservasDetalle
        if (reservasDetalle && Array.isArray(reservasDetalle)) {
          console.log("🔄 Usando reservasDetalle como fallback para plazas")

          const plazaCount: { [key: string]: number } = {}

          reservasDetalle.forEach((reserva) => {
            const plaza = reserva.plaza || reserva.ubicacion || "Sin plaza"
            plazaCount[plaza] = (plazaCount[plaza] || 0) + 1
          })

          const fallbackData = Object.entries(plazaCount)
            .map(([plaza, cantidad]) => ({
              plaza,
              cantidad,
              displayName:
                plaza.length > 15 ? plaza.slice(0, 15) + "..." : plaza,
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10)

          console.log("🔄 Datos fallback de plazas generados:", fallbackData)
          return fallbackData
        }

        console.log("❌ No hay datos válidos de plazas para procesar")
        return []
      }

      // Procesar datos ya calculados por el backend
      const plazasDataArray = plazasMasReservadas
        .map((item, index) => {
          console.log(`   procesando plaza ${index}:`, item)

          const plaza = item.nombre || item.plaza || item.name || "Sin nombre"
          const cantidad =
            item.totalReservas || item.cantidad || item.count || 0

          const processed = {
            plaza: plaza,
            cantidad: Number(cantidad),
            displayName: plaza.length > 15 ? plaza.slice(0, 15) + "..." : plaza,
          }

          console.log(`   resultado procesado ${index}:`, processed)
          return processed
        })
        .filter((item) => {
          const isValid = item.cantidad > 0
          if (!isValid) {
            console.log("   ⚠️ Filtrando plaza sin reservas:", item)
          }
          return isValid
        })
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
        .slice(0, 10) // Top 10 plazas

      console.log("📈 Array final de plazas procesadas:", plazasDataArray)
      console.log("📈 Longitud final:", plazasDataArray.length)

      return plazasDataArray
    },
    []
  )

  // Función para hacer refetch manual
  const refetch = useCallback(() => {
    console.log(`🚀 Iniciando refetch de plazas para rango: ${rango}`)
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
        console.log(`✅ RESPUESTA COMPLETA DEL BACKEND PARA PLAZAS (${rango}):`)
        console.log("   res:", res)
        console.log("   res.data:", res.data)
        console.log(
          "   estructura de res.data:",
          res.data ? Object.keys(res.data) : "no data"
        )

        if (res.data && typeof res.data === "object") {
          // CORREGIR: Extraer los datos del campo 'data'
          const responseData = res.data.data || res.data

          console.log("🔍 DETALLES DE LA RESPUESTA DE PLAZAS:")
          console.log("   res.data completo:", res.data)
          console.log("   responseData extraído:", responseData)
          console.log(
            "   plazasMasReservadas:",
            responseData.plazasMasReservadas
          )
          console.log("   reservasDetalle:", responseData.reservasDetalle)
          console.log("   campos disponibles:", Object.keys(responseData || {}))

          // Usar plazasMasReservadas del backend desde la ubicación correcta
          const processedPlazasData = processPlazasData(
            responseData.plazasMasReservadas,
            responseData.reservasDetalle
          )

          console.log(`📊 RESULTADO FINAL DEL PROCESAMIENTO DE PLAZAS:`, {
            totalPlazas: processedPlazasData.length,
            topPlaza: processedPlazasData[0]?.plaza,
            topPlazaCantidad: processedPlazasData[0]?.cantidad,
            allPlazas: processedPlazasData.map(
              (p) => `${p.plaza}: ${p.cantidad}`
            ),
          })

          setData(responseData) // Usar responseData en lugar de res.data
          setPlazasData(processedPlazasData)
          setError(null)
        } else {
          console.log("❌ Respuesta inválida del servidor para plazas:", res)
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

        console.error(`❌ ERROR COMPLETO EN EL HOOK DE PLAZAS (${rango}):`, {
          error: err,
          message: err.message,
          stack: err.stack,
          name: err.name,
        })

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
        console.log(`🏁 Finalizando refetch de plazas para ${rango}`)
        setLoading(false)
      })
  }, [rango, processPlazasData])

  useEffect(() => {
    console.log(`🎯 useEffect de plazas ejecutándose para rango: ${rango}`)
    refetch()

    // Cleanup: cancelar petición al desmontar o cambiar rango
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  // Log del estado actual
  console.log(`📊 ESTADO ACTUAL DEL HOOK DE PLAZAS (${rango}):`, {
    loading,
    error,
    hasData: !!data,
    plazasDataLength: plazasData.length,
    plazasData: plazasData.slice(0, 3), // Mostrar solo las primeras 3 para no saturar
  })

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
          totalReservas: plazasData.reduce(
            (sum, plaza) => sum + plaza.cantidad,
            0
          ),
        }
      : null,
  }
}
