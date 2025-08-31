/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
import { EstadisticasBackendResponse } from "../types/range"

export const usePlazasStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasBackendResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // ✨ NUEVO: Ref para trackear si el componente está montado
  const isMountedRef = useRef(true)

  // Función para hacer refetch manual
  const refetch = useCallback(async () => {
    // ✨ No hacer nada si el componente está desmontado
    if (!isMountedRef.current) return

    setError(null)
    setLoading(true)

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()

    try {
      const res = await getPlazasStatsByRangeServiceAlt(
        rango,
        abortControllerRef.current.signal
      )

      // ✨ Verificar si el componente sigue montado antes de actualizar estado
      if (!isMountedRef.current) return

      console.log(`✅ Respuesta del backend (${rango}):`, res.data)

      if (res.data && typeof res.data === "object") {
        console.log(`📊 Datos procesados:`, {
          plazasPublicadas: res.data.plazasPublicadas,
          plazasPrivadas: res.data.plazasPrivadas,
          totalDetalles: res.data.plazasDetalle?.length,
        })

        setData(res.data)
        setError(null)
      } else {
        setError("Respuesta inválida del servidor")
        setData(null)
      }
    } catch (err: any) {
      // ✨ No hacer nada si el componente está desmontado
      if (!isMountedRef.current) return
      // Manejo silencioso de peticiones canceladas
      if (
        err.name === "AbortError" ||
        err.name === "CanceledError" ||
        err.message === "canceled"
      ) {
        console.log(
          `🚫 Petición cancelada para hook de tipos/ciudades: ${rango}`
        )
        return
      }

      // ✨ Manejo silencioso de peticiones canceladas
      if (
        err.name === "AbortError" ||
        err.name === "CanceledError" ||
        err.message === "canceled"
      ) {
        console.log(`🚫 Petición cancelada para rango: ${rango}`)
        return
      }

      console.error(`❌ Error en el hook (${rango}):`, err)

      // Manejo más específico de errores
      let errorMessage = "Error al obtener las estadísticas"

      if (err.response?.status === 401) {
        errorMessage = "No autorizado - verifica tu sesión"
      } else if (err.response?.status === 404) {
        errorMessage = "Endpoint no encontrado"
      } else if (err.response?.status === 500) {
        errorMessage = "Error interno del servidor"
      } else if (err.response?.status === 429) {
        errorMessage = "Demasiadas peticiones - intenta más tarde"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setData(null)
    } finally {
      // ✨ Solo actualizar loading si el componente sigue montado
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [rango])

  useEffect(() => {
    refetch()

    // Cleanup: cancelar petición al desmontar o cambiar rango
    return () => {
      // ✨ Marcar componente como desmontado
      isMountedRef.current = false

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  // ✨ Actualizar isMountedRef cuando el hook se monta nuevamente
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,

    // Helpers adicionales para fácil acceso a datos específicos
    stats: data
      ? {
          totalPublicadas: data.plazasPublicadas,
          totalPrivadas: data.plazasPrivadas,
          totalInmediatas: data.plazasInmediatas,
          totalDetalles: data.plazasDetalle?.length || 0,
          promediosPorTipo: data.precioPromedioPorTipo,
          promediosPorCiudad: data.precioPromedioPorCiudad,
        }
      : null,
  }
}
