/* eslint-disable @typescript-eslint/no-explicit-any */
// services/deactivateUser.ts
import axios from "axios"

const API_BASE_URL = "https://kns.aparcoyo.com"

export const deactivateUserService = async (
  userId: string | number
): Promise<any> => {
  try {
    // Obtener el token del localStorage o donde lo guardes
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken")

    const response = await axios.patch(
      `${API_BASE_URL}/apa/usuarios/desactivar/${userId}`,
      {}, // Body vacío para PATCH
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("❌ Error al desactivar usuario:", error)
    throw error
  }
}
