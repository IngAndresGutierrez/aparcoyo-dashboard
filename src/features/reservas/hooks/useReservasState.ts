import { useEffect, useState, useCallback, useRef } from "react"
import { getReservasStatsByRangeService } from "../services/reservas"
import { ReservasChartDataPoint, EstadisticasReservasResponse, ReservaDetalle } from "../types/reservas-range"

const filtrarPorRango = (reservas: ReservaDetalle[], rango: "dia" | "semana" | "mes"): ReservaDetalle[] => {
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

export const useReservasEstadoStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasReservasResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [estadoData, setEstadoData] = useState<ReservasChartDataPoint[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const processEstadoData = useCallback((reservasDetalle: ReservaDetalle[]): ReservasChartDataPoint[] => {
    if (!reservasDetalle || !Array.isArray(reservasDetalle)) return []
    const estadoCounts = reservasDetalle.reduce((acc, reserva) => {
      const estado = reserva.estado || "Sin estado"
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const estadoLabels: Record<string, string> = {
      pendiente: "Pendiente", confirmado: "Confirmado", confirmada: "Confirmado",
      cancelado: "Cancelado", cancelada: "Cancelado", activo: "Activo",
      activa: "Activo", finalizado: "Finalizado", finalizada: "Finalizado",
    }
    return Object.entries(estadoCounts)
      .map(([estado, cantidad]) => ({
        estado,
        cantidad,
        displayName: estadoLabels[estado.toLowerCase()] || estado.charAt(0).toUpperCase() + estado.slice(1),
      }))
      .filter((item) => item.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [])

  const refetch = useCallback(() => {
    setError(null)
    setLoading(true)
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    getReservasStatsByRangeService(rango, abortControllerRef.current.signal)
      .then((res) => {
        const responseData = res.data?.data
        if (responseData && responseData.reservasDetalle) {
          // ✅ Filtrar por rango en el frontend
          const reservasFiltradas = filtrarPorRango(responseData.reservasDetalle, rango)
          console.log(`📅 Filtro "${rango}": ${responseData.reservasDetalle.length} total → ${reservasFiltradas.length} en rango`)

          const processedEstadoData = processEstadoData(reservasFiltradas)

          setData({
            ...responseData,
            reservasTotal: reservasFiltradas.length,
            reservasCanceladas: reservasFiltradas.filter(r => r.estado === "cancelado" || r.estado === "cancelada").length,
            plazasConReservaActiva: reservasFiltradas.filter(r => r.estado === "confirmado" || r.estado === "confirmada" || r.estado === "activo" || r.estado === "activa").length,
            reservasDetalle: reservasFiltradas,
          })
          setEstadoData(processedEstadoData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setEstadoData([])
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message || "Error al obtener las estadísticas")
        setData(null)
        setEstadoData([])
      })
      .finally(() => setLoading(false))
  }, [rango, processEstadoData])

  useEffect(() => {
    refetch()
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort() }
  }, [refetch])

  return {
    data, loading, error, refetch, estadoData,
    stats: data ? {
      totalEstados: estadoData.length,
      topEstado: estadoData[0]?.estado || "N/A",
      topEstadoCantidad: estadoData[0]?.cantidad || 0,
      totalReservas: estadoData.reduce((sum, e) => sum + e.cantidad, 0),
      reservasTotal: data.reservasTotal || 0,
      reservasCanceladas: data.reservasCanceladas || 0,
      plazasConReservaActiva: data.plazasConReservaActiva || 0,
      totalDetalles: data.reservasDetalle?.length || 0,
    } : null,
  }
}