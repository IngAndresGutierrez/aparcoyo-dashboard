// hooks/useReservasCityStats.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import { ReservasCityChartDataPoint } from "../types/reservas-range"
import {
  EstadisticasReservasResponse,
  ReservasPorCiudad,
  ReservaDetalle,
} from "../types/reservas-range"

export const useReservasCityStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [cityData, setCityData] = useState<ReservasCityChartDataPoint[]>([])

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para procesar datos por ciudad usando reservasPorCiudad
  const processCityData = useCallback(
    (
      reservasPorCiudad: ReservasPorCiudad[],
      reservasDetalle: ReservaDetalle[]
    ): ReservasCityChartDataPoint[] => {
      console.log("🔍 DATOS RECIBIDOS EN processCityData:")
      console.log("   reservasPorCiudad:", reservasPorCiudad)
      console.log("   tipo de reservasPorCiudad:", typeof reservasPorCiudad)
      console.log("   es array:", Array.isArray(reservasPorCiudad))
      console.log("   longitud:", reservasPorCiudad?.length)

      if (
        reservasPorCiudad &&
        Array.isArray(reservasPorCiudad) &&
        reservasPorCiudad.length > 0
      ) {
        console.log("   primer elemento:", reservasPorCiudad[0])
        console.log(
          "   estructura del primer elemento:",
          Object.keys(reservasPorCiudad[0] || {})
        )
      }

      console.log("   reservasDetalle para backup:", reservasDetalle)
      console.log("   reservasDetalle tipo:", typeof reservasDetalle)
      console.log(
        "   reservasDetalle es array:",
        Array.isArray(reservasDetalle)
      )

      if (!reservasPorCiudad || !Array.isArray(reservasPorCiudad)) {
        console.log(
          "❌ reservasPorCiudad no es un array válido, intentando usar reservasDetalle"
        )

        // FALLBACK: Si reservasPorCiudad no está disponible, usar reservasDetalle
        if (reservasDetalle && Array.isArray(reservasDetalle)) {
          console.log("🔄 Usando reservasDetalle como fallback")

          const cityCount: { [key: string]: number } = {}

          reservasDetalle.forEach((reserva) => {
            const ciudad = reserva.ciudad || reserva.ubicacion || "Sin ciudad"
            cityCount[ciudad] = (cityCount[ciudad] || 0) + 1
          })

          const fallbackData = Object.entries(cityCount)
            .map(([ciudad, cantidad]) => ({
              ciudad,
              cantidad,
              displayName: ciudad.charAt(0).toUpperCase() + ciudad.slice(1),
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10)

          console.log("🔄 Datos fallback generados:", fallbackData)
          return fallbackData
        }

        console.log("❌ No hay datos válidos para procesar")
        return []
      }

      // Procesar datos ya calculados por el backend
      const cityDataArray = reservasPorCiudad
        .map((item, index) => {
          console.log(`   procesando item ${index}:`, item)

          const ciudad =
            item.ciudad || item.name || item.ubicacion || "Sin ciudad"
          const cantidad =
            item.totalReservas || item.cantidad || item.count || 0

          const processed = {
            ciudad: ciudad,
            cantidad: Number(cantidad),
            displayName: ciudad.charAt(0).toUpperCase() + ciudad.slice(1),
          }

          console.log(`   resultado procesado ${index}:`, processed)
          return processed
        })
        .filter((item) => {
          const isValid = item.cantidad > 0
          if (!isValid) {
            console.log("   ⚠️ Filtrando item sin reservas:", item)
          }
          return isValid
        })
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
        .slice(0, 10) // Top 10 ciudades

      console.log("📈 Array final de ciudades procesadas:", cityDataArray)
      console.log("📈 Longitud final:", cityDataArray.length)

      return cityDataArray
    },
    []
  )

  // Función para hacer refetch manual
  const refetch = useCallback(() => {
    console.log(`🚀 Iniciando refetch para rango: ${rango}`)
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
        console.log(`✅ RESPUESTA COMPLETA DEL BACKEND (${rango}):`)
        console.log("   res:", res)
        console.log("   res.data:", res.data)
        console.log(
          "   estructura de res.data:",
          res.data ? Object.keys(res.data) : "no data"
        )

        if (res.data && typeof res.data === "object") {
          // CORREGIR: Extraer los datos del campo 'data'
          const responseData = res.data.data || res.data

          console.log("🔍 DETALLES DE LA RESPUESTA:")
          console.log("   res.data completo:", res.data)
          console.log("   responseData extraído:", responseData)
          console.log("   reservasPorCiudad:", responseData.reservasPorCiudad)
          console.log("   reservasDetalle:", responseData.reservasDetalle)
          console.log("   campos disponibles:", Object.keys(responseData || {}))

          // Usar reservasPorCiudad del backend desde la ubicación correcta
          const processedCityData = processCityData(
            responseData.reservasPorCiudad,
            responseData.reservasDetalle
          )

          console.log(`📊 RESULTADO FINAL DEL PROCESAMIENTO:`, {
            totalCities: processedCityData.length,
            topCity: processedCityData[0]?.ciudad,
            topCityCantidad: processedCityData[0]?.cantidad,
            allCities: processedCityData.map(
              (c) => `${c.ciudad}: ${c.cantidad}`
            ),
          })

          setData(responseData) // Usar responseData en lugar de res.data
          setCityData(processedCityData)
          setError(null)
        } else {
          console.log("❌ Respuesta inválida del servidor:", res)
          setError("Respuesta inválida del servidor")
          setData(null)
          setCityData([])
        }
      })
      .catch((err) => {
        // No mostrar error si la petición fue cancelada
        if (err.name === "AbortError") {
          console.log(`🚫 Petición de ciudades cancelada para rango: ${rango}`)
          return
        }

        console.error(`❌ ERROR COMPLETO EN EL HOOK (${rango}):`, {
          error: err,
          message: err.message,
          stack: err.stack,
          name: err.name,
        })

        let errorMessage = "Error al obtener las estadísticas de ciudades"

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
        setCityData([])
      })
      .finally(() => {
        console.log(`🏁 Finalizando refetch para ${rango}`)
        setLoading(false)
      })
  }, [rango, processCityData])

  useEffect(() => {
    console.log(`🎯 useEffect ejecutándose para rango: ${rango}`)
    refetch()

    // Cleanup: cancelar petición al desmontar o cambiar rango
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  // Log del estado actual
  console.log(`📊 ESTADO ACTUAL DEL HOOK (${rango}):`, {
    loading,
    error,
    hasData: !!data,
    cityDataLength: cityData.length,
    cityData: cityData.slice(0, 3), // Mostrar solo los primeros 3 para no saturar
  })

  return {
    data,
    loading,
    error,
    refetch,
    cityData, // Datos procesados para el gráfico

    // Stats adicionales
    stats: data
      ? {
          totalCities: cityData.length,
          topCity: cityData[0]?.ciudad || "N/A",
          topCityCantidad: cityData[0]?.cantidad || 0,
          averageCantidad:
            cityData.length > 0
              ? Math.round(
                  cityData.reduce((sum, city) => sum + city.cantidad, 0) /
                    cityData.length
                )
              : 0,
          totalReservas: cityData.reduce((sum, city) => sum + city.cantidad, 0),
        }
      : null,
  }
}
