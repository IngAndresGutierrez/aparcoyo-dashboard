/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useMetrics.ts
import { useState, useEffect } from "react"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

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
  refetch: () => Promise<void>
}

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  // OPCIÓN 1: Desde localStorage (más común)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || 
           localStorage.getItem('token') || 
           localStorage.getItem('accessToken')
  }
  
  // OPCIÓN 2: Desde sessionStorage
  // if (typeof window !== 'undefined') {
  //   return sessionStorage.getItem('authToken')
  // }
  
  // OPCIÓN 3: Desde cookies
  // if (typeof document !== 'undefined') {
  //   const match = document.cookie.match(/(?:^|;\s*)authToken\s*=\s*([^;]+)/)
  //   return match ? match[1] : null
  // }
  
  return null
}

export const useMetrics = (): UseMetricsReturn => {
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
    // Si es un array, retornamos la longitud
    if (Array.isArray(data)) {
      return data.length
    }

    // Si es un objeto con propiedades conocidas
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

    // Si es un número directamente
    if (typeof data === "number") {
      return data
    }

    // Por defecto retornamos 0
    return 0
  }

  const fetchMetrics = async (): Promise<void> => {
    try {
      setGlobalLoading(true)
      setGlobalError(null)

      const endpoints: Endpoint[] = [
        { key: "users", url: `${API_BASE_URL}/apa/usuarios` },
        { key: "plazas", url: `${API_BASE_URL}/apa/plazas` },
        // OPCIÓN 1: Usar endpoint de estadísticas para plazas ocupadas
        { key: "activeReservas", url: `${API_BASE_URL}/apa/plazas/estadisticas?tipo=ocupadas` },
        // OPCIÓN 2: Usar endpoint de reservas activas si existe
        // { key: "activeReservas", url: `${API_BASE_URL}/apa/reservas/activas` },
        { key: "totalReservas", url: `${API_BASE_URL}/apa/reservas` },
      ]

      // Obtener el token de autenticación
      const token = getAuthToken()

      // Preparar headers base
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }

      // Agregar Authorization header si tenemos token
      if (token) {
        headers.Authorization = `Bearer ${token}`
        console.log('Token encontrado, length:', token.length) // Debug
      } else {
        console.warn('No se encontró token de autenticación') // Debug
      }

      const results = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(endpoint.url, {
            method: 'GET',
            headers,
            credentials: 'omit', // Cambiar a 'include' si necesitas enviar cookies
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
            console.log(`${endpoint.key} response:`, data) // Debug

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
          let statusText = ""

          if (result.status === "fulfilled") {
            const status = result.value.status
            statusText = result.value.statusText || ""

            // Mensajes específicos para códigos de error comunes
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
              case 502:
                errorMessage = "Bad Gateway - Servidor no disponible"
                break
              case 503:
                errorMessage = "Servicio no disponible"
                break
              default:
                errorMessage = `HTTP ${status} ${statusText}`
            }

            // Log detallado para debugging
            console.error(`Error fetching ${endpoint.key}:`, {
              status,
              statusText,
              url: endpoint.url,
              hasToken: !!token,
              tokenPreview: token ? `${token.substring(0, 10)}...` : 'N/A',
            })

            // Si es 401 y no tenemos token, es probable que necesite autenticación
            if (status === 401 && !token) {
              console.warn(`${endpoint.key} requiere autenticación pero no se encontró token`)
            }

            // Si es 401 y sí tenemos token, el token puede estar expirado
            if (status === 401 && token) {
              console.warn(`${endpoint.key} devolvió 401 - el token puede estar expirado`)
            }
          } else {
            console.error(`Network error for ${endpoint.key}:`, result.reason)
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

      // Marcar todos como error
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

  // Ejecutar fetch al montar el componente
  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading: globalLoading,
    error: globalError,
    refetch: fetchMetrics,
  }
}