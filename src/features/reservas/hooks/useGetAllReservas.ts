import { useState } from "react"
import { Reserva } from "../types"
import { getAllReservasService } from "../services/reservas"

export const useGetAllReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getAllReservas = async () => {
    try {
      setIsLoading(true)
      
      // Verificar que hay token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No hay token de autenticación");
        return;
      }
      
      const response = await getAllReservasService()
      console.log("✅ Datos recibidos:", response.data.data)
      setReservas(response.data.data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error obteniendo reservas:", error?.response?.data)
      
      // Si es error 401, el token puede estar expirado
      if (error?.response?.status === 401) {
        console.error("🔐 Token inválido o expirado");
        localStorage.removeItem("token"); // Limpia el token inválido
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { getAllReservas, reservas, isLoading }
}