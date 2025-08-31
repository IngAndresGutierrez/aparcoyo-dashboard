/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useMetrics.ts
import { useState, useEffect } from "react"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

// Tipo para el filtro de tiempo
export type TimeFilter = "day" | "week" | "month"

// Interfaces para las respuestas de la API
interface ApiResponse {
  total?: number
  count?: number
  data?: any[]
}

// Tipo para una métrica individual
interface MetricState {
  value: number
  loading: boolean
  error: string | null
}

// Tipo para todas las métricas
interface MetricsState {
  users: MetricState
  plazas: MetricState
  activeReservas: MetricState
  totalReservas: MetricState
}

// Tipo para el endpoint
interface Endpoint {
  key: keyof MetricsState
  url: string
}

// Tipo de retorno del hook
interface UseMetricsReturn {
  metrics: MetricsState
  loading: boolean
  error: string | null
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  refetch: () => Promise<void>
}

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    )
  }
  return null
}

// Función para obtener parámetros de fecha según el filtro
const getDateParams = (filter: TimeFilter): string => {
  const now = new Date()
  let startDate: Date

  switch (filter) {
    case "day":
      // Últimas 24 horas
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "week":
      // Últimos 7 días
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      // Últimos 30 días
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const startDateString = startDate.toISOString().split("T")[0]
  const endDateString = now.toISOString().split("T")[0]

  return `?startDate=${startDateString}&endDate=${endDateString}`
}

export const useMetrics = (): UseMetricsReturn => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [metrics, setMetrics] = useState<MetricsState>({
    users: { value: 0, loading: true, error: null },
    plazas: { value: 0, loading: true, error: null },
    activeReservas: { value: 0, loading: true, error: null },
    totalReservas: { value: 0, loading: true, error: null },
  })

  const [globalLoading, setGlobalLoading] = useState<boolean>(true)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Función helper para extraer el valor según la estructura de la respuesta
  const extractValue = (data: unknown): number => {
    if (Array.isArray(data)) {
      return data.length
    }

    if (data && typeof data === "object") {
      const apiResponse = data as ApiResponse

      if (typeof apiResponse.total === "number") {
        return apiResponse.total
      }

      if (typeof apiResponse.count === "number") {
        return apiResponse.count
      }

      if (Array.isArray(apiResponse.data)) {
        return apiResponse.data.length
      }
    }

    if (typeof data === "number") {
      return data
    }

    return 0
  }

  const fetchMetrics = async (): Promise<void> => {
    try {
      setGlobalLoading(true)
      setGlobalError(null)

      // Obtener parámetros de fecha según el filtro seleccionado
      const dateParams = getDateParams(timeFilter)

      const endpoints: Endpoint[] = [
        { key: "users", url: `${API_BASE_URL}/apa/usuarios${dateParams}` },
        { key: "plazas", url: `${API_BASE_URL}/apa/plazas` }, // Las plazas no cambian por tiempo
        {
          key: "activeReservas",
          url: `${API_BASE_URL}/apa/plazas/estadisticas?tipo=ocupadas${dateParams.replace(
            "?",
            "&"
          )}`,
        },
        {
          key: "totalReservas",
          url: `${API_BASE_URL}/apa/reservas${dateParams}`,
        },
      ]

      const token = getAuthToken()

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const results = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(endpoint.url, {
            method: "GET",
            headers,
            credentials: "omit",
          })
        )
      )

      const newMetrics: MetricsState = { ...metrics }

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const endpoint = endpoints[i]

        if (result.status === "fulfilled" && result.value.ok) {
          try {
            const data: unknown = await result.value.json()

            newMetrics[endpoint.key] = {
              value: extractValue(data),
              loading: false,
              error: null,
            }
          } catch (jsonError) {
            console.error(`Error parsing JSON for ${endpoint.key}:`, jsonError)
            newMetrics[endpoint.key] = {
              value: 0,
              loading: false,
              error: "Error parsing response",
            }
          }
        } else {
          let errorMessage = "Network error"

          if (result.status === "fulfilled") {
            const status = result.value.status
            const statusText = result.value.statusText || ""

            switch (status) {
              case 400:
                errorMessage = "Bad Request - Verificar endpoint"
                break
              case 401:
                errorMessage = "No autorizado - Token inválido o requerido"
                break
              case 403:
                errorMessage = "Acceso prohibido - Permisos insuficientes"
                break
              case 404:
                errorMessage = "Endpoint no encontrado"
                break
              case 429:
                errorMessage = "Demasiadas peticiones - Intenta más tarde"
                break
              case 500:
                errorMessage = "Error interno del servidor"
                break
              default:
                errorMessage = `HTTP ${status} ${statusText}`
            }

            console.error(`Error fetching ${endpoint.key}:`, {
              status,
              statusText,
              url: endpoint.url,
              hasToken: !!token,
            })
          }

          newMetrics[endpoint.key] = {
            value: 0,
            loading: false,
            error: errorMessage,
          }
        }
      }

      setMetrics(newMetrics)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch metrics"
      setGlobalError(errorMessage)

      setMetrics((prev) => {
        const errorMetrics: MetricsState = {} as MetricsState

        for (const key in prev) {
          const metricKey = key as keyof MetricsState
          errorMetrics[metricKey] = {
            ...prev[metricKey],
            loading: false,
            error: "Network error",
          }
        }

        return errorMetrics
      })
    } finally {
      setGlobalLoading(false)
    }
  }

  // Refetch cuando cambia el filtro de tiempo
  useEffect(() => {
    fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter])

  // Función para cambiar el filtro y refrescar datos
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
  }

  return {
    metrics,
    loading: globalLoading,
    error: globalError,
    timeFilter,
    setTimeFilter: handleTimeFilterChange,
    refetch: fetchMetrics,
  }
}
