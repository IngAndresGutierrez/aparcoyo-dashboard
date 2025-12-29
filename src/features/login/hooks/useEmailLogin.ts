/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { emailLoginService } from "../services/login"

export const useEmailLogin = (email: string, password: string) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const onClickEmailButtonLogin = async () => {
    setError(false)

    try {
      setIsLoading(true)
      const response = await emailLoginService(email, password)

      // 💾 BUSCAR EL TOKEN
      const token =
        response.data.token ||
        response.data.accessToken ||
        response.data.data?.token ||
        response.data.access_token ||
        response.data.authToken

      if (!token) {
        console.error("❌ No se encontró el token en la respuesta")
        setError(true)
        return
      }

      // 🔐 VALIDAR EL ROL
      const userRole = (
        response.data.data?.user?.rol || // 👈 AGREGA ESTE
        response.data.data?.user?.role ||
        response.data.user?.rol ||
        response.data.user?.role ||
        response.data.rol ||
        response.data.role ||
        ""
      )
        .toString()
        .toUpperCase()
        .trim()

      console.log("🔍 ROL DETECTADO:", userRole, "- Tipo:", typeof userRole)

      if (userRole !== "ADMIN") {
        setError(true)
        return // 👈 NO navegar si no es admin
      }

      // ✅ Si llegamos aquí, todo está bien
      localStorage.setItem("token", token)
      console.log("✅ Login exitoso. Rol:", userRole)

      router.push("/home")
    } catch (error: any) {
      console.error(
        "❌ Error en login:",
        error?.response?.data || error?.message
      )
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return { onClickEmailButtonLogin, isLoading, error }
}
