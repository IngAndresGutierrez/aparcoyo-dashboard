/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const isMountedRef = useRef(true)

  // Función para procesar datos por ciudad
  const processCityData = useCallback(
    (plazasDetalle: any[]): CityChartDataPoint[] => {
      if (!plazasDetalle || !Array.isArray(plazasDetalle)) {
        return []
      }

      // Agrupar por ciudad y calcular promedios
      const cityGroups = plazasDetalle.reduce((acc, plaza) => {
        // ✅ Extraer ciudad de la dirección
        const direccionCompleta = plaza.direccion || "Sin ciudad"
        const partesDireccion = direccionCompleta
          .split(",")
          .map((s: string) => s.trim())
        const city =
          partesDireccion.length >= 2
            ? partesDireccion[partesDireccion.length - 2]
            : "Sin ciudad"

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
        .sort((a, b) => b.averagePrice - a.averagePrice)
        .slice(0, 10)

      return cityDataArray
    },
    []
  )

  // Función para hacer refetch manual
  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return

    setError(null)
    setLoading(true)

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    try {
      const res = await getPlazasStatsByRangeServiceAlt(
        rango,
        abortControllerRef.current.signal
      )

      if (!isMountedRef.current) return

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
    } catch (err: any) {
      if (!isMountedRef.current) return

      // ✨ MANEJO SILENCIOSO DE CANCELACIÓN AL INICIO
      if (
        err.name === "AbortError" ||
        err.name === "CanceledError" ||
        err.message === "canceled" ||
        err.code === "ERR_CANCELED"
      ) {
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
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [rango, processCityData])

  useEffect(() => {
    refetch()

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    cityData,

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
