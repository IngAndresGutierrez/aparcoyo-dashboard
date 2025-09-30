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
    if (!state.data?.data.graphData) return []

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return state.data.data.graphData.current
      .filter((item) => {
        const fechaItem = new Date(item.date)
        fechaItem.setHours(0, 0, 0, 0)

        switch (rango) {
          case "day":
            return fechaItem.getTime() === hoy.getTime()
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
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        current: item.amount,
        previous: 0,
      }))
  }, [state.data, rango])

  // ✅ Memorizar transactions filtradas
  const transactions = useMemo(() => {
    if (!state.data?.data.transactions) return []

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return state.data.data.transactions.filter((t) => {
      if (!t.fecha) return false

      const fechaTransaccion = new Date(t.fecha)
      fechaTransaccion.setHours(0, 0, 0, 0)

      switch (rango) {
        case "day":
          return fechaTransaccion.getTime() === hoy.getTime()
        case "week":
          const hace7Dias = new Date(hoy)
          hace7Dias.setDate(hoy.getDate() - 7)
          return fechaTransaccion >= hace7Dias && fechaTransaccion <= hoy
        case "month":
        default:
          const hace30Dias = new Date(hoy)
          hace30Dias.setDate(hoy.getDate() - 30)
          return fechaTransaccion >= hace30Dias && fechaTransaccion <= hoy
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
