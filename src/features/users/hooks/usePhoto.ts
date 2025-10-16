import { useState, useCallback } from "react"
import {
  UpdatePhotoResponse,
  updateUserProfilePhoto,
} from "../services/service-photo"

interface UseUpdateProfilePhotoReturn {
  updatePhoto: (
    userId: string | number,
    file: File
  ) => Promise<UpdatePhotoResponse | null>
  isLoading: boolean
  error: string | null
  success: boolean
  clearError: () => void
  clearSuccess: () => void
}

export const useUpdateProfilePhoto = (): UseUpdateProfilePhotoReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updatePhoto = useCallback(
    async (
      userId: string | number,
      file: File
    ): Promise<UpdatePhotoResponse | null> => {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await updateUserProfilePhoto(userId, file)

        if (response.ok) {
          setSuccess(true)
          return response
        } else {
          throw new Error(response.message || "Error desconocido")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar foto"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearSuccess = useCallback(() => {
    setSuccess(false)
  }, [])

  return {
    updatePhoto,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  }
}
