import { useState } from "react"

import { Reserva } from "../types"
import { getAllReservasService } from "../services/reservas"

export const useGetAllReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAllReservas = async () => {
    try {
      setIsLoading(true)
      const response = await getAllReservasService()
      console.log("Datos recibidos:", response.data.data)
      setReservas(response.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllReservas, reservas, isLoading }
}
