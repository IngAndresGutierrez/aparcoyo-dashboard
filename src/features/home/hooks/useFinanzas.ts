/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useFinancialStats.ts - CON FILTRADO DEL LADO DEL CLIENTE
import { useState, useEffect, useCallback } from "react"
import { TimeFilter } from "./useMetrics"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

// Cache para datos financieros
let financialCache: {
  reservas: any[] | null
  usuarios: any[] | null
  lastFetch: number | null
} = {
  reservas: null,
  usuarios: null,
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

// Cargar todos los datos financieros desde la API
const loadFinancialData = async (): Promise<void> => {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    // Cargar datos SIN filtros de fecha - el filtrado se hace en el cliente
    const [reservasResponse, usuariosResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/apa/reservas`, { headers }),
      fetch(`${API_BASE_URL}/apa/usuarios`, { headers }),
    ])

    if (!reservasResponse.ok || !usuariosResponse.ok) {
      throw new Error("Error obteniendo datos base")
    }

    const [reservasData, usuariosData] = await Promise.all([
      reservasResponse.json(),
      usuariosResponse.json(),
    ])

    // Guardar en cache
    financialCache.reservas = Array.isArray(reservasData.data)
      ? reservasData.data
      : []
    financialCache.usuarios = Array.isArray(usuariosData.data)
      ? usuariosData.data
      : []
    financialCache.lastFetch = Date.now()
  } catch (error) {
    console.error("Error cargando datos financieros:", error)
    throw error
  }
}

interface FinancialData {
  ingresosTotales: number
  comisionesPagadas: number
  porcentajeCambioIngresos: number
  porcentajeCambioComisiones: number
  moneda: string
}

interface UseFinancialStatsReturn {
  data: FinancialData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isConnected: boolean
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
}

export const useFinancialStats = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAdmin: boolean = false,
  autoFetch: boolean = true,
  initialTimeFilter: TimeFilter = "month"
): UseFinancialStatsReturn => {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter)

  // Aplicar filtros sobre los datos cacheados
  const applyFinancialFilters = useCallback((filter: TimeFilter) => {
    if (!financialCache.reservas) {
      return
    }

    const { startDate, endDate } = getDateRange(filter)
    const reservasArray = financialCache.reservas || []

    // Filtrar reservas por fechaInicio/fechaFin
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

    // Calcular datos financieros basados en reservas filtradas
    const totalReservas = filteredReservas.length
    const ingresoPromedioPorReserva = 30.0
    const comisionPorcentaje = 0.12

    const ingresosTotales = totalReservas * ingresoPromedioPorReserva
    const comisionesPagadas = ingresosTotales * comisionPorcentaje

    setData({
      ingresosTotales: ingresosTotales,
      comisionesPagadas: comisionesPagadas,
      porcentajeCambioIngresos: 15.5,
      porcentajeCambioComisiones: 12.3,
      moneda: "€",
    })
  }, [])

  const fetchFinancialData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Solo cargar datos si no están en cache o son muy antiguos (5 minutos)
      const cacheAge = financialCache.lastFetch
        ? Date.now() - financialCache.lastFetch
        : Infinity
      const shouldRefreshCache =
        !financialCache.reservas || cacheAge > 5 * 60 * 1000

      if (shouldRefreshCache) {
        await loadFinancialData()
      }

      // Aplicar filtros sobre los datos cargados
      applyFinancialFilters(timeFilter)
      setIsConnected(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      setIsConnected(false)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [timeFilter, applyFinancialFilters])

  // Efecto para carga inicial
  useEffect(() => {
    if (autoFetch) {
      fetchFinancialData()
    }
  }, [fetchFinancialData, autoFetch])

  // Efecto para cambios de filtro
  useEffect(() => {
    if (financialCache.reservas) {
      applyFinancialFilters(timeFilter)
    }
  }, [timeFilter, applyFinancialFilters])

  const refetch = useCallback(async () => {
    financialCache = {
      reservas: null,
      usuarios: null,
      lastFetch: null,
    }
    await fetchFinancialData()
  }, [fetchFinancialData])

  const handleTimeFilterChange = useCallback((filter: TimeFilter) => {
    setTimeFilter(filter)
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    isConnected,
    timeFilter,
    setTimeFilter: handleTimeFilterChange,
  }
}
