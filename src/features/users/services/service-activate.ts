/* eslint-disable @typescript-eslint/no-explicit-any */
// services/activateUser.ts - CORREGIDO
import axios from "axios"

const API_BASE_URL = "https://kns.aparcoyo.com"

export const activateUserService = async (
  userId: string | number
): Promise<any> => {
  try {
    // Obtener el token del localStorage
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken")

    console.log(`📡 ACTIVANDO usuario ${userId}...`)
    console.log(`🔗 URL: ${API_BASE_URL}/apa/usuarios/desactivar/${userId}`)

    // ✅ USAR EL MISMO ENDPOINT QUE PARA DESACTIVAR
    const response = await axios.patch(
      `${API_BASE_URL}/apa/usuarios/desactivar/${userId}`, // ← MISMO ENDPOINT
      {}, // Body vacío para PATCH
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    console.log(`✅ Usuario ${userId} activado. Respuesta:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Error al activar usuario ${userId}:`, error)
    throw error
  }
}
