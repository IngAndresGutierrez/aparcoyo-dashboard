import { useState, useCallback } from "react"
import { comisionesService } from "../services/comisiones-service"
import {
  ConfiguracionComisiones,
  ActualizarComisionesPayload,
} from "../types/comisiones"

interface UseComisionesReturn {
  configuracion: ConfiguracionComisiones | null
  isLoading: boolean
  error: string | null
  obtenerConfiguracion: () => Promise<ConfiguracionComisiones | void>
  actualizarConfiguracion: (
    payload: ActualizarComisionesPayload
  ) => Promise<ConfiguracionComisiones | void>
  resetError: () => void
}

export function useComisiones(): UseComisionesReturn {
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionComisiones | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resetear error manualmente
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  // GET - Obtener configuración
  const obtenerConfiguracion = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await comisionesService.obtenerConfiguracion()
      setConfiguracion(data)
      return data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener configuración"
      setError(errorMessage)
      console.error("Error al obtener configuración:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // PATCH - Actualizar configuración
  const actualizarConfiguracion = useCallback(
    async (payload: ActualizarComisionesPayload) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await comisionesService.actualizarConfiguracion(payload)
        setConfiguracion(data)
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al actualizar configuración"
        setError(errorMessage)
        console.error("Error al actualizar configuración:", err)
        throw err // Re-lanzar para que el componente pueda manejarlo
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    configuracion,
    isLoading,
    error,
    obtenerConfiguracion,
    actualizarConfiguracion,
    resetError,
  }
}
