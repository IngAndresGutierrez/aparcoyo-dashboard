import { useEffect, useState, useCallback, useRef } from "react"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
import { CityChartDataPoint } from "../types/chart-city"
import { EstadisticasBackendResponse } from "../types/range"

export const usePlazasCityStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasBackendResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [cityData, setCityData] = useState<CityChartDataPoint[]>([])

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para procesar datos por ciudad
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processCityData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (plazasDetalle: any[]): CityChartDataPoint[] => {
      if (!plazasDetalle || !Array.isArray(plazasDetalle)) {
        return []
      }

      // Agrupar por ciudad y calcular promedios
      const cityGroups = plazasDetalle.reduce((acc, plaza) => {
        const city = plaza.ciudad || plaza.city || "Sin ciudad"
        const price = parseFloat(plaza.precio) || 0

        if (!acc[city]) {
          acc[city] = {
            totalPrice: 0,
            count: 0,
            city: city,
          }
        }

        acc[city].totalPrice += price
        acc[city].count += 1

        return acc
      }, {} as Record<string, { totalPrice: number; count: number; city: string }>)

      // Convertir a array y calcular promedios
      const cityDataArray = Object.values(cityGroups)
        .map((group) => {
          const typedGroup = group as {
            totalPrice: number
            count: number
            city: string
          }
          return {
            city: typedGroup.city,
            averagePrice:
              typedGroup.count > 0
                ? Math.round(typedGroup.totalPrice / typedGroup.count)
                : 0,
            count: typedGroup.count,
            displayName:
              typedGroup.city.charAt(0).toUpperCase() +
              typedGroup.city.slice(1),
          }
        })
        .sort((a, b) => b.averagePrice - a.averagePrice) // Ordenar por precio promedio descendente
        .slice(0, 10) // Top 10 ciudades

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

    getPlazasStatsByRangeServiceAlt(rango, abortControllerRef.current.signal)
      .then((res) => {
        console.log(
          `✅ Respuesta del backend para ciudades (${rango}):`,
          res.data
        )

        if (res.data && typeof res.data === "object") {
          const processedCityData = processCityData(res.data.plazasDetalle)

          console.log(`📊 Datos de ciudades procesados:`, {
            totalCities: processedCityData.length,
            topCity: processedCityData[0]?.city,
            topCityPrice: processedCityData[0]?.averagePrice,
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

        if (err.response?.status === 401) {
          errorMessage = "No autorizado - verifica tu sesión"
        } else if (err.response?.status === 404) {
          errorMessage = "Endpoint no encontrado"
        } else if (err.response?.status === 500) {
          errorMessage = "Error interno del servidor"
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
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
          topCity: cityData[0]?.city || "N/A",
          topCityPrice: cityData[0]?.averagePrice || 0,
          averagePrice:
            cityData.length > 0
              ? Math.round(
                  cityData.reduce((sum, city) => sum + city.averagePrice, 0) /
                    cityData.length
                )
              : 0,
        }
      : null,
  }
}
