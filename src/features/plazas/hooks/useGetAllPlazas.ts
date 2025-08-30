import { useState } from "react"
import { getAllPlazasService } from "../services/plazas"
import { Plaza } from "../types"

export const useGetAllPlazas = () => {
  const [plazas, setPlazas] = useState<Plaza[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAllPlazas = async () => {
    try {
      setIsLoading(true)
      const response = await getAllPlazasService()
      setPlazas(response.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllPlazas, plazas, isLoading }
}
