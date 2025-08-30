// hooks/useLogout.ts
import { useState } from "react"
import { useRouter } from "next/navigation"
import { handleLogout } from "../services/loggout"

export const useLogout = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const onClickLogoutButton = async () => {
    setError(false)

    try {
      setIsLoading(true)
      const result = await handleLogout()

      if (result.success) {
        console.log("✅ Logout exitoso")

        // Redirigir al login o página principal
        router.push("/login") // Ajusta la ruta según tu estructura

        // Opcional: Recargar la página para limpiar cualquier estado residual
        // window.location.reload()
      } else {
        console.error("❌ Error en logout:", result.error)
        setError(true)

        // Aún así redirigir porque el token ya fue eliminado
        router.push("/login")
      }
    } catch (error) {
      console.error("Error en logout:", error)
      setError(true)

      // Forzar limpieza y redirección incluso con error
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return { onClickLogoutButton, isLoading, error }
}
