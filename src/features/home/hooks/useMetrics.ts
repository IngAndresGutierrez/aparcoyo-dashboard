/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useMetrics.ts - CON FILTRADO DEL LADO DEL CLIENTE
import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

export type TimeFilter = "day" | "week" | "month"

interface MetricState {
  value: number
  loading: boolean
  error: string | null
}

interface MetricsState {
  users: MetricState
  plazas: MetricState
  activeReservas: MetricState
  totalReservas: MetricState
}

interface UseMetricsReturn {
  metrics: MetricsState
  loading: boolean
  error: string | null
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  refetch: () => Promise<void>
}

// Cache global para datos completos
let dataCache: {
  users: any[] | null
  reservas: any[] | null
  plazas: any[] | null
  activeReservas: any | null
  lastFetch: number | null
} = {
  users: null,
  reservas: null,
  plazas: null,
  activeReservas: null,
  lastFetch: null,
}

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

// Función para obtener rango de fechas según filtro
const getDateRange = (
  filter: TimeFilter
): { startDate: Date; endDate: Date } => {
  const now = new Date()
  let startDate: Date

  switch (filter) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { startDate, endDate: now }
}

// Cargar todos los datos desde la API
const loadAllData = async (): Promise<void> => {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const [usersRes, reservasRes, plazasRes, activeRes] = await Promise.all([
      fetch(
        `${API_BASE_URL}/apa/usuarios?limit=9999&sortBy=fechaRegistro&sort`,
        { headers }
      ),
      fetch(`${API_BASE_URL}/apa/reservas`, { headers }),
      fetch(`${API_BASE_URL}/apa/plazas`, { headers }),
      fetch(`${API_BASE_URL}/apa/plazas/estadisticas?tipo=ocupadas`, {
        headers,
      }),
    ])

    // Procesar usuarios
    if (usersRes.ok) {
      const usersData = await usersRes.json()
      const usersArray =
        usersData.ok && Array.isArray(usersData.data) ? usersData.data : []
      dataCache.users = usersArray
      if (typeof window !== "undefined") {
        ;(window as any).dataCache = dataCache
      }
    }

    // Procesar reservas
    if (reservasRes.ok) {
      const reservasData = await reservasRes.json()
      const reservasArray =
        reservasData.ok && Array.isArray(reservasData.data)
          ? reservasData.data
          : []
      dataCache.reservas = reservasArray
    }

    // Procesar plazas
    if (plazasRes.ok) {
      const plazasData = await plazasRes.json()
      const plazasArray =
        plazasData.ok && Array.isArray(plazasData.data) ? plazasData.data : []
      dataCache.plazas = plazasArray
    }

    // Procesar reservas activas
    if (activeRes.ok) {
      dataCache.activeReservas = await activeRes.json()
    }

    dataCache.lastFetch = Date.now()
  } catch (error) {
    console.error("Error cargando datos:", error)
    throw error
  }
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

  // Aplicar filtros sobre los datos cacheados
  const applyFilters = useCallback((filter: TimeFilter) => {
    if (!dataCache.users && !dataCache.reservas) {
      return
    }

    const { startDate, endDate } = getDateRange(filter)
    const usersArray = dataCache.users || []
    const reservasArray = dataCache.reservas || []

    // 1. Filtrar reservas por fechaInicio/fechaFin
    const filteredReservas = reservasArray.filter((reserva) => {
      const dateValue = reserva.fechaInicio || reserva.fechaFin

      if (!dateValue) {
        return false
      }

      const itemDate = new Date(dateValue)

      if (isNaN(itemDate.getTime())) {
        return false
      }

      return itemDate >= startDate && itemDate <= endDate
    })

    // 2. Usuarios que tienen reservas en el período

    // 3. Plazas totales (estáticas)
    const plazasArray = dataCache.plazas || []
    const totalPlazas = plazasArray.length

    // 4. Plazas activas basadas en reservas filtradas
    const plazasActivasIds = new Set(
      filteredReservas
        .filter(
          (reserva) =>
            reserva.estado === "pendiente" ||
            reserva.estado === "activa" ||
            reserva.estado === "confirmada" ||
            reserva.estado === "ocupada"
        )
        .map((reserva) => reserva.plaza?.id)
        .filter(Boolean)
    )

    const activeReservasCount = plazasActivasIds.size

    // 5. Actualizar métricas
    setMetrics({
      users: {
        value: usersArray.length, // Mostrar todos los usuarios registrados (50)
        loading: false,
        error: null,
      },
      plazas: {
        value: totalPlazas,
        loading: false,
        error: null,
      },
      activeReservas: {
        value: activeReservasCount,
        loading: false,
        error: null,
      },
      totalReservas: {
        value: filteredReservas.length,
        loading: false,
        error: null,
      },
    })
  }, [])

  // Función principal de fetch
  const fetchMetrics = useCallback(async (): Promise<void> => {
    try {
      setGlobalLoading(true)
      setGlobalError(null)

      // Solo cargar datos si no están en cache o son muy antiguos (5 minutos)
      const cacheAge = dataCache.lastFetch
        ? Date.now() - dataCache.lastFetch
        : Infinity
      const shouldRefreshCache =
        !dataCache.users || !dataCache.reservas || cacheAge > 5 * 60 * 1000

      if (shouldRefreshCache) {
        await loadAllData()
      }

      // Aplicar filtros sobre los datos cargados
      applyFilters(timeFilter)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error cargando métricas"
      setGlobalError(errorMessage)

      // Resetear métricas en caso de error
      setMetrics({
        users: { value: 0, loading: false, error: "Error cargando datos" },
        plazas: { value: 0, loading: false, error: "Error cargando datos" },
        activeReservas: {
          value: 0,
          loading: false,
          error: "Error cargando datos",
        },
        totalReservas: {
          value: 0,
          loading: false,
          error: "Error cargando datos",
        },
      })
    } finally {
      setGlobalLoading(false)
    }
  }, [timeFilter, applyFilters])

  // Efecto para carga inicial
  useEffect(() => {
    fetchMetrics()
  }, [])

  // Efecto para cambios de filtro
  useEffect(() => {
    if (dataCache.users || dataCache.reservas) {
      applyFilters(timeFilter)
    }
  }, [timeFilter, applyFilters])

  // Función para cambiar filtro
  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
  }

  // Función de refetch
  const handleRefetch = useCallback(async () => {
    dataCache = {
      users: null,
      reservas: null,
      plazas: null,
      activeReservas: null,
      lastFetch: null,
    }
    await fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading: globalLoading,
    error: globalError,
    timeFilter,
    setTimeFilter: handleTimeFilterChange,
    refetch: handleRefetch,
  }
}
