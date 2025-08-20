// services/reservaService.ts

import { DeleteReservaResponse } from "../types/delete"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

export const reservaService = {
  // ... otros métodos existentes

  deleteReserva: async (
    id: string | number
  ): Promise<DeleteReservaResponse> => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/apa/reservas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        console.error(`❌ Error ${response.status}: ${response.statusText}`)
        console.error(`URL: ${API_BASE_URL}/apa/reservas/${id}`)

        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            // Mensaje específico para foreign key constraints
            if (
              errorData.message.includes("foreign key constraint") ||
              errorData.message.includes("violates foreign key") ||
              errorData.message.includes("pagos")
            ) {
              errorMessage =
                "No se puede eliminar esta reserva porque tiene pagos asociados. Contacte al administrador."
            } else {
              errorMessage = errorData.message
            }
          }
        } catch {
          // Si no se puede parsear el JSON, usar mensaje genérico
        }

        throw new Error(errorMessage)
      }

      // Manejar respuesta exitosa
      if (response.status === 204) {
        return { success: true, message: "Reserva eliminada correctamente" }
      }

      try {
        // ✅ Si hay data del servidor, la ignoras pero retornas solo success y message
        await response.json() // Parsea la respuesta pero no la uses
        return {
          success: true,
          message: "Reserva eliminada correctamente",
          // ❌ Quitar: data
        }
      } catch {
        return {
          success: true,
          message: "Reserva eliminada correctamente",
        }
      }
    } catch (error) {
      console.error("Error eliminando reserva:", error)
      throw error
    }
  },
}
