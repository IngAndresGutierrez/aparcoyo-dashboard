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
      console.log(response)
      router.push("/")
    } catch (error: any) {
      console.log(error?.response?.data?.ok)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return { onClickEmailButtonLogin, isLoading, error }
}
