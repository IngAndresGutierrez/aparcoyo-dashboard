import axios from "axios"
import { EstadisticasPlazasResponse } from "../types/range"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/plazas/estadisticas"

export const getPlazasStatsByRangeServiceAlt = (
  rango: "dia" | "semana" | "mes"
) => {
  // Prueba diferentes ubicaciones del token
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token")

  return axios.get<EstadisticasPlazasResponse>(`${BASE_URL}/${rango}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        },
  })
}
