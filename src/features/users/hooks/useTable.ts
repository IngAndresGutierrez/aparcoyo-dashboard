/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react"
import { UsuariosTablaParams, UsuarioTabla } from "../types/table"
import { UsuariosTablaService } from "../services/service-table"

interface UseUsuariosTablaReturn {
  usuarios: UsuarioTabla[]
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  refetch: () => Promise<void>
  fetchUsuarios: (params: UsuariosTablaParams) => Promise<void>
  isConnected: boolean
}

/**
 * Hook para obtener y manejar la tabla de usuarios
 * @param initialParams - Parámetros iniciales de filtrado y paginación
 * @param autoFetch - Si debe hacer fetch automático al montar el componente
 * @returns Objeto con usuarios, loading, error y funciones de control
 */
export const useUsuariosTabla = (
  initialParams: UsuariosTablaParams = {},
  autoFetch: boolean = true
): UseUsuariosTablaReturn => {
  const [usuarios, setUsuarios] = useState<UsuarioTabla[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(initialParams.page || 1)
  const [limit, setLimit] = useState<number>(initialParams.limit || 10)

  const fetchUsuarios = useCallback(
    async (params: UsuariosTablaParams = {}) => {
      setLoading(true)
      setError(null)

      try {
        const response = await UsuariosTablaService.getUsuarios(params)
        setUsuarios(response.data)
        setTotal(response.total || response.data.length)
        setPage(response.page || params.page || 1)
        setLimit(response.limit || params.limit || 10)
        setIsConnected(true)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al obtener usuarios"

        setError(errorMessage)
        setIsConnected(false)
        setUsuarios([])

        console.error(`❌ Error en useUsuariosTabla:`, err)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Fetch automático SOLO una vez al montar - SIN DEPENDENCIAS DE initialParams
  useEffect(() => {
    if (autoFetch) {
      fetchUsuarios(initialParams)
    }
  }, [fetchUsuarios, autoFetch]) // ← REMOVIDO initialParams para evitar loop

  const refetch = useCallback(async () => {
    await fetchUsuarios({ page, limit })
  }, [fetchUsuarios, page, limit])

  return {
    usuarios,
    loading,
    error,
    total,
    page,
    limit,
    refetch,
    fetchUsuarios,
    isConnected,
  }
}
