import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import {
  EstadisticasReservasResponse,
  ReservaDetalle,
} from "../types/reservas-range"

export interface PlazasChartDataPoint {
  plaza: string
  cantidad: number
  displayName: string
}

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

export const useReservasPlazasStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [plazasData, setPlazasData] = useState<PlazasChartDataPoint[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const processPlazasData = useCallback(
    (reservasFiltradas: ReservaDetalle[]): PlazasChartDataPoint[] => {
      if (!reservasFiltradas || !Array.isArray(reservasFiltradas)) return []
      const plazaCount: Record<string, number> = {}
      reservasFiltradas.forEach((reserva) => {
        const plaza = reserva.plaza || "Sin plaza"
        plazaCount[plaza] = (plazaCount[plaza] || 0) + 1
      })
      return Object.entries(plazaCount)
        .map(([plaza, cantidad]) => ({
          plaza,
          cantidad,
          displayName: plaza.length > 15 ? plaza.slice(0, 15) + "..." : plaza,
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
          // ✅ Filtrar por rango y recalcular plazas desde el frontend
          const reservasFiltradas = filtrarPorRango(
            responseData.reservasDetalle,
            rango,
          )
          console.log(
            `📅 Plazas - Filtro "${rango}": ${responseData.reservasDetalle.length} total → ${reservasFiltradas.length} en rango`,
          )

          const processedPlazasData = processPlazasData(reservasFiltradas)
          setData({ ...responseData, reservasDetalle: reservasFiltradas })
          setPlazasData(processedPlazasData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setPlazasData([])
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message || "Error al obtener las estadísticas de plazas")
        setData(null)
        setPlazasData([])
      })
      .finally(() => setLoading(false))
  }, [rango, processPlazasData])

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
    plazasData,
    stats: data
      ? {
          totalPlazas: plazasData.length,
          topPlaza: plazasData[0]?.plaza || "N/A",
          topPlazaCantidad: plazasData[0]?.cantidad || 0,
          averageCantidad:
            plazasData.length > 0
              ? Math.round(
                  plazasData.reduce((sum, p) => sum + p.cantidad, 0) /
                    plazasData.length,
                )
              : 0,
          totalReservas: plazasData.reduce((sum, p) => sum + p.cantidad, 0),
        }
      : null,
  }
}
