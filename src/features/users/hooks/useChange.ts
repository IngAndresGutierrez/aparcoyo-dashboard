/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useUserActions.ts
import { useState } from "react"
import { deactivateUserService } from "../services/service-deactivate"
import { activateUserService } from "../services/service-activate"

interface UseUserActionsReturn {
  changeUserStatus: (
    userId: string | number,
    isCurrentlyActive: boolean
  ) => Promise<void>
  isLoading: boolean
  error: string | null
  success: boolean
}

export const useUserActions = (): UseUserActionsReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const changeUserStatus = async (
    userId: string | number,
    isCurrentlyActive: boolean
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (isCurrentlyActive) {
        // Si está activo, desactivar
        await deactivateUserService(userId)
        console.log("✅ Usuario desactivado correctamente")
      } else {
        // Si está inactivo, activar
        await activateUserService(userId)
        console.log("✅ Usuario activado correctamente")
      }

      setSuccess(true)
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Error al cambiar estado del usuario"
      setError(errorMessage)
      console.error(
        "❌ Error al cambiar estado del usuario:",
        err?.response?.data || err
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    changeUserStatus,
    isLoading,
    error,
    success,
  }
}
