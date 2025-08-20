// hooks/useReservasCityStats.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import { ReservasCityChartDataPoint } from "../types/reservas-range"
import { 
  EstadisticasReservasResponse, 
  ReservasPorCiudad, 
  ReservaDetalle 
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
    (reservasPorCiudad: ReservasPorCiudad[], reservasDetalle: ReservaDetalle[]): ReservasCityChartDataPoint[] => {
      console.log("🔍 reservasPorCiudad recibido:", reservasPorCiudad)
      console.log("🔍 reservasDetalle para backup:", reservasDetalle)

      if (!reservasPorCiudad || !Array.isArray(reservasPorCiudad)) {
        console.log("❌ reservasPorCiudad no es un array válido")
        return []
      }

      // Procesar datos ya calculados por el backend
      const cityDataArray = reservasPorCiudad
        .map((item) => {
          const ciudad = item.ciudad || "Sin ciudad"
          return {
            ciudad: ciudad,
            cantidad: item.totalReservas || 0,
            displayName: ciudad.charAt(0).toUpperCase() + ciudad.slice(1),
          }
        })
        .filter((item) => item.cantidad > 0) // Solo ciudades con reservas
        .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
        .slice(0, 10) // Top 10 ciudades

      console.log("📈 Array final de ciudades:", cityDataArray)

      return cityDataArray
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
          `✅ Respuesta del backend para ciudades (${rango}):`,
          res.data
        )

        if (res.data && typeof res.data === "object") {
          // Usar reservasPorCiudad del backend
          const processedCityData = processCityData(
            res.data.reservasPorCiudad, 
            res.data.reservasDetalle
          )

          console.log(`📊 Datos de ciudades procesados:`, {
            totalCities: processedCityData.length,
            topCity: processedCityData[0]?.ciudad,
            topCityCantidad: processedCityData[0]?.cantidad,
          })

          setData(res.data)
          setCityData(processedCityData)
          setError(null)
        } else {
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

        console.error(`❌ Error en el hook de ciudades (${rango}):`, err)

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
        setLoading(false)
      })
  }, [rango, processCityData])

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