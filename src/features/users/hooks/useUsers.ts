import { useState, useEffect, useCallback } from "react"
import { RangoEstadisticas, UsuarioEstadisticas } from "../types/graphic"
import { UsuariosService } from "../services/service-graphic"

interface UseUsuariosStatsReturn {
  data: UsuarioEstadisticas | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isConnected: boolean
}

/**
 * Hook para obtener estadísticas de usuarios
 * @param rango - Período de tiempo para las estadísticas
 * @param autoFetch - Si debe hacer fetch automático al montar el componente
 * @returns Objeto con data, loading, error y función refetch
 */
export const useUsuariosStats = (
  rango: RangoEstadisticas = "mes",
  autoFetch: boolean = true
): UseUsuariosStatsReturn => {
  const [data, setData] = useState<UsuarioEstadisticas | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(true)

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await UsuariosService.getEstadisticas(rango)
      setData(response.data)
      setIsConnected(true)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al obtener estadísticas de usuarios"

      setError(errorMessage)
      setIsConnected(false)
      setData(null) // Limpiar datos anteriores en caso de error

      console.error(`❌ Error en useUsuariosStats:`, err)
    } finally {
      setLoading(false)
    }
  }, [rango])

  // Fetch automático cuando cambia el rango
  useEffect(() => {
    if (autoFetch) {
      fetchEstadisticas()
    }
  }, [fetchEstadisticas, autoFetch])

  const refetch = useCallback(async () => {
    await fetchEstadisticas()
  }, [fetchEstadisticas])

  return {
    data,
    loading,
    error,
    refetch,
    isConnected,
  }
}
