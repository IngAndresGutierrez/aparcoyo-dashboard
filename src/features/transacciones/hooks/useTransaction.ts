// hooks/usePlatformStats.ts
import { useState, useEffect, useCallback, useMemo } from "react"
import { PlatformStatsResponse } from "../types/transaction"
import { platformStatsService } from "../services/transaction-service"

interface UsePlatformStatsState {
  data: PlatformStatsResponse | null
  loading: boolean
  error: string | null
}

interface UsePlatformStatsOptions {
  refetchInterval?: number
  autoFetch?: boolean
  rango?: "day" | "week" | "month"
}

const rangoToPeriod = {
  day: "daily",
  week: "weekly",
  month: "monthly",
} as const

export const usePlatformStats = (options: UsePlatformStatsOptions = {}) => {
  const { refetchInterval, autoFetch = true, rango = "month" } = options

  const [state, setState] = useState<UsePlatformStatsState>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchStats = useCallback(async () => {
    console.log("🔄 Iniciando fetchStats con rango:", rango)
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("🔄 Llamando a platformStatsService...")

      const period = rangoToPeriod[rango]
      const data = await platformStatsService.getPlatformStatisticsByPeriod(
        period
      )
      console.log("✅ Datos COMPLETOS recibidos del backend:", data)
      console.log("✅ Transacciones del backend:", data?.data?.transactions)
      console.log(
        "✅ Total transacciones backend:",
        data?.data?.transactions?.length || 0
      )
      console.log("✅ Datos recibidos en hook:", data)

      if (!data) {
        throw new Error("No se recibieron datos del servidor")
      }

      setState({
        data,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("❌ Error en fetchStats:", error)
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack available"
      )

      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else {
        errorMessage = JSON.stringify(error)
      }

      console.error("❌ Error message final:", errorMessage)

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
    }
  }, [rango])

  const fetchStatsByPeriod = useCallback(
    async (period: "daily" | "weekly" | "monthly" | "yearly") => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await platformStatsService.getPlatformStatisticsByPeriod(
          period
        )
        setState({
          data,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    },
    []
  )

  const fetchStatsByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data =
          await platformStatsService.getPlatformStatisticsByDateRange(
            startDate,
            endDate
          )
        setState({
          data,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    },
    []
  )

  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }
  }, [fetchStats, autoFetch])

  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchStats, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, refetchInterval])

  // ✅ Memorizar chartData filtrado
  const chartData = useMemo(() => {
    if (!state.data?.data.graphData?.current) {
      console.log("❌ No hay graphData")
      return []
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    console.log("🔍 Procesando chartData:", {
      rango,
      hoy: hoy.toISOString(),
      totalItemsBackend: state.data.data.graphData.current.length,
    })

    // Para "day", buscar específicamente la fecha de hoy
    if (rango === "day") {
      const itemHoy = state.data.data.graphData.current.find((item) => {
        // El backend devuelve fechas en formato "YYYY-MM-DD"
        const fechaItem = item.date // "2025-10-21"
        const fechaHoy = hoy.toISOString().split("T")[0] // "2025-10-21"

        console.log("🔍 Buscando hoy:", {
          itemDate: fechaItem,
          fechaHoy: fechaHoy,
          match: fechaItem === fechaHoy,
        })

        return fechaItem === fechaHoy
      })

      if (itemHoy) {
        console.log("✅ Encontrado dato para hoy:", itemHoy)
        return [
          {
            date: "Hoy",
            current: itemHoy.amount,
            previous: 0,
          },
        ]
      }

      // Si no hay dato en graphData, calcular desde transactions
      console.log("⚠️ No hay graphData para hoy, calculando desde transactions")
      const transaccionesHoy = (state.data.data.transactions || []).filter(
        (t) => {
          if (!t.fecha) return false
          return t.fecha === hoy.toISOString().split("T")[0]
        }
      )

      const totalHoy = transaccionesHoy.reduce((sum, t) => {
        const importe =
          parseFloat(String(t.importe || "0").replace(/[^\d.-]/g, "")) || 0
        return sum + Math.abs(importe)
      }, 0)

      return [
        {
          date: "Hoy",
          current: totalHoy,
          previous: 0,
        },
      ]
    }

    // Para "week" y "month", filtrar normalmente
    const filtered = state.data.data.graphData.current.filter((item) => {
      const fechaItem = new Date(item.date)
      fechaItem.setHours(0, 0, 0, 0)

      switch (rango) {
        case "week":
          const hace7Dias = new Date(hoy)
          hace7Dias.setDate(hoy.getDate() - 7)
          return fechaItem >= hace7Dias && fechaItem <= hoy
        case "month":
        default:
          const hace30Dias = new Date(hoy)
          hace30Dias.setDate(hoy.getDate() - 30)
          return fechaItem >= hace30Dias && fechaItem <= hoy
      }
    })

    console.log("✅ Datos filtrados para", rango, ":", filtered.length)

    return filtered.map((item) => ({
      date: new Date(item.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      }),
      current: item.amount,
      previous: 0,
    }))
  }, [state.data, rango])

  // ✅ Memorizar transactions filtradas
  // En usePlatformStats.ts, reemplaza el useMemo de transactions por esto:
  const transactions = useMemo(() => {
    if (!state.data?.data.transactions) return []

    const ahora = new Date()
    // Normalizar "ahora" para que solo compare fecha, sin hora
    ahora.setHours(0, 0, 0, 0)

    return state.data.data.transactions.filter((t) => {
      if (!t.fecha) return false

      // ✅ Parsear como fecha local, no UTC
      const [año, mes, dia] = t.fecha.split("-").map(Number)
      const fechaTransaccion = new Date(año, mes - 1, dia)
      fechaTransaccion.setHours(0, 0, 0, 0) // 👈 IMPORTANTE: normalizar hora

      switch (rango) {
        case "day": {
          console.log("🔍 Comparando fechas:", {
            fechaTransaccion: fechaTransaccion.toISOString(),
            ahora: ahora.toISOString(),
            sonIguales: fechaTransaccion.getTime() === ahora.getTime(),
            transaccion: t.factura,
          })
          return fechaTransaccion.getTime() === ahora.getTime()
        }

        case "week": {
          const hace7Dias = new Date(ahora)
          hace7Dias.setDate(ahora.getDate() - 7)
          return fechaTransaccion >= hace7Dias && fechaTransaccion <= ahora
        }

        case "month":
        default: {
          const hace30Dias = new Date(ahora)
          hace30Dias.setDate(ahora.getDate() - 30)
          return fechaTransaccion >= hace30Dias && fechaTransaccion <= ahora
        }
      }
    })
  }, [state.data, rango])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
    fetchStats,
    fetchStatsByPeriod,
    fetchStatsByDateRange,
    statistics: state.data?.data || null,
    chartData,
    transactions,
    hasData: state.data !== null,
    isSuccess: state.data !== null && !state.loading && !state.error,
  }
}
