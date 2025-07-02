import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerService } from "../services/register"

export const useEmailRegister = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const onClickEmailButtonRegister = async (data: {
    rol: string
    documento: string
    nombre: string
    telefono: string
    email: string
    password: string
    direccion: string
    isActive: boolean
  }) => {
    setError(false)
    try {
      setIsLoading(true)
      const response = await registerService(data)
      console.log("✅ Registrado:", response)
      router.push("/login")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("❌ Error del backend:", error?.response?.data)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return { onClickEmailButtonRegister, isLoading, error }
}
