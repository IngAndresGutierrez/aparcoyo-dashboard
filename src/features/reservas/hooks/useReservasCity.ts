import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import {
  ReservasCityChartDataPoint,
  EstadisticasReservasResponse,
  ReservaDetalle,
} from "../types/reservas-range"

const filtrarPorRango = (
  reservas: ReservaDetalle[],
  rango: "dia" | "semana" | "mes",
): ReservaDetalle[] => {
  const ahora = new Date()
  const desde = new Date()
  if (rango === "dia") desde.setHours(0, 0, 0, 0)
  else if (rango === "semana") desde.setDate(ahora.getDate() - 7)
  else if (rango === "mes") desde.setMonth(ahora.getMonth() - 1)
  return reservas.filter((r) => {
    const fecha = new Date(r.fechaInicio)
    return fecha >= desde && fecha <= ahora
  })
}

export const useReservasCityStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [cityData, setCityData] = useState<ReservasCityChartDataPoint[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const processCityData = useCallback(
    (reservasFiltradas: ReservaDetalle[]): ReservasCityChartDataPoint[] => {
      if (!reservasFiltradas || !Array.isArray(reservasFiltradas)) return []
      const cityCount: Record<string, number> = {}
      reservasFiltradas.forEach((reserva) => {
        const ciudad = reserva.ciudad || "Sin ciudad"
        cityCount[ciudad] = (cityCount[ciudad] || 0) + 1
      })
      return Object.entries(cityCount)
        .map(([ciudad, cantidad]) => ({
          ciudad,
          cantidad,
          displayName: ciudad.charAt(0).toUpperCase() + ciudad.slice(1),
        }))
        .filter((item) => item.cantidad > 0)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
    },
    [],
  )

  const refetch = useCallback(() => {
    setError(null)
    setLoading(true)
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    getReservasStatsByRangeService(rango, abortControllerRef.current.signal)
      .then((res) => {
        const responseData = res.data?.data
        if (responseData && responseData.reservasDetalle) {
          // ✅ Filtrar por rango y recalcular ciudades desde el frontend
          const reservasFiltradas = filtrarPorRango(
            responseData.reservasDetalle,
            rango,
          )
          console.log(
            `📅 Ciudades - Filtro "${rango}": ${responseData.reservasDetalle.length} total → ${reservasFiltradas.length} en rango`,
          )

          const processedCityData = processCityData(reservasFiltradas)
          setData({ ...responseData, reservasDetalle: reservasFiltradas })
          setCityData(processedCityData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setCityData([])
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message || "Error al obtener las estadísticas de ciudades")
        setData(null)
        setCityData([])
      })
      .finally(() => setLoading(false))
  }, [rango, processCityData])

  useEffect(() => {
    refetch()
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [refetch])

  return {
    data,
    loading,
    error,
    refetch,
    cityData,
    stats: data
      ? {
          totalCities: cityData.length,
          topCity: cityData[0]?.ciudad || "N/A",
          topCityCantidad: cityData[0]?.cantidad || 0,
          averageCantidad:
            cityData.length > 0
              ? Math.round(
                  cityData.reduce((sum, c) => sum + c.cantidad, 0) /
                    cityData.length,
                )
              : 0,
          totalReservas: cityData.reduce((sum, c) => sum + c.cantidad, 0),
        }
      : null,
  }
}
