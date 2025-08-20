// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { emailLoginService } from "../services/login"

// export const useEmailLogin = (email: string, password: string) => {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(false)

//   const onClickEmailButtonLogin = async () => {
//     setError(false)

//     try {
//       setIsLoading(true)
//       const response = await emailLoginService(email, password)
//       console.log(response)
//       router.push("/home")
//     } catch (error: any) {
//       console.log(error?.response?.data?.ok)
//       setError(true)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return { onClickEmailButtonLogin, isLoading, error }
// }

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

      // 🔍 DEBUGGING: Ver qué devuelve el backend
      console.log("=== RESPUESTA DEL LOGIN ===")
      console.log("Respuesta completa:", response.data)
      console.log("¿Hay token?:", response.data.token ? "SÍ" : "NO")
      console.log("¿Hay accessToken?:", response.data.accessToken ? "SÍ" : "NO")
      console.log("¿Hay data.token?:", response.data.data?.token ? "SÍ" : "NO")
      console.log("============================")

      // 💾 GUARDAR EL TOKEN - Ajusta según la estructura de tu respuesta
      const token =
        response.data.token ||
        response.data.accessToken ||
        response.data.data?.token ||
        response.data.access_token ||
        response.data.authToken

      if (token) {
        localStorage.setItem("token", token)
        console.log(
          "✅ Token guardado exitosamente:",
          token.substring(0, 20) + "..."
        )

        // Verificar que se guardó
        console.log(
          "✅ Verificación - Token en localStorage:",
          localStorage.getItem("token") ? "SÍ" : "NO"
        )

        // Redirigir después de guardar el token
        router.push("/home")
      } else {
        // Si no encontramos el token, mostrar toda la estructura para debugging
        console.error("❌ NO SE ENCONTRÓ TOKEN")
        console.error("Estructura completa de la respuesta:")
        console.error(JSON.stringify(response.data, null, 2))
        setError(true)
      }
    } catch (error: any) {
      console.log("Error en login:", error?.response?.data?.ok)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return { onClickEmailButtonLogin, isLoading, error }
}
