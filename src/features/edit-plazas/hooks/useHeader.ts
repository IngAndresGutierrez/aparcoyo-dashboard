/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePlazaById.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { adaptPlazaForHeader, PlazaDetailResponse } from "../types/header-plaza"
import { getPlazaByIdService } from "../services/header-service"

interface UsePlazaByIdParams {
  plazaId?: string
  autoFetch?: boolean
}

export const usePlazaById = ({
  plazaId,
  autoFetch = true,
}: UsePlazaByIdParams = {}) => {
  const [data, setData] = useState<PlazaDetailResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Ref para controlar si el componente está montado
  const isMountedRef = useRef(true)

  // Ref para evitar peticiones duplicadas
  const currentRequestRef = useRef<string | null>(null)

  // Función para obtener la plaza - SIN AbortController
  const fetchPlaza = useCallback(async (targetPlazaId?: string) => {
    const finalPlazaId = targetPlazaId || plazaId

    if (!finalPlazaId) {
      console.warn("⚠️ PlazaId no proporcionado para fetchPlaza")
      setError("ID de plaza requerido")
      return
    }

    if (!isMountedRef.current) return

    // Evitar peticiones duplicadas
    if (currentRequestRef.current === finalPlazaId) return
    currentRequestRef.current = finalPlazaId

    setError(null)
    setLoading(true)

    try {
      const response = await getPlazaByIdService({
        plazaId: finalPlazaId,
        // SIN signal - eliminamos completamente AbortController
      })

      if (!isMountedRef.current) return

      console.log(`✅ Plaza obtenida ${finalPlazaId}:`, {
        nombre: response.data.nombre,
        direccion: response.data.direccion,
        tipo: response.data.tipo,
        precio: response.data.precio,
      })

      setData(response.data)
      setError(null)
    } catch (err: any) {
      if (!isMountedRef.current) return

      console.error(`❌ Error obteniendo plaza ${finalPlazaId}:`, err)

      const errorMessage = err.message || "Error al obtener la plaza"
      setError(errorMessage)
      setData(null)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
      currentRequestRef.current = null
    }
  }, [])

  // Función para obtener plaza adaptada para PlazaHeader
  const getPlazaForHeader = useCallback(() => {
    return data ? adaptPlazaForHeader(data) : null
  }, [data])

  // Refetch manual
  const refetch = useCallback(
    (targetPlazaId?: string) => {
      return fetchPlaza(targetPlazaId)
    },
    [fetchPlaza]
  )

  // Auto-fetch - SUPER SIMPLE
  useEffect(() => {
    if (autoFetch && plazaId) {
      setData(null)
      setError(null)
      fetchPlaza(plazaId)
    }
  }, [plazaId, autoFetch])

  // Cleanup minimo al desmontar
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    // Estado principal
    data,
    loading,
    error,

    // Funciones
    fetchPlaza,
    refetch,
    getPlazaForHeader,

    // Estado adicional útil
    isSuccess: !loading && !error && data !== null,
    isEmpty: !loading && !error && data === null,
    isLoading: loading,
    hasError: !!error,
  }
}
