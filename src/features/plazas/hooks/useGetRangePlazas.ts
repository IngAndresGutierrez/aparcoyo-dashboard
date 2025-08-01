import { useEffect, useState } from "react"
import { EstadisticasPlazas } from "../types/range"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
// ← IMPORTAR el servicio

export const usePlazasStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasPlazas | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Resetear error al cambiar de rango
    setError(null)
    setLoading(true)

    getPlazasStatsByRangeServiceAlt(rango) // ← Usar el nombre correcto
      .then((res) => {
        console.log("Respuesta del backend:", res.data) // 👈 Para debugging

        if (res.data.ok && res.data.data) {
          setData(res.data.data)
        } else {
          setError(res.data.msg || "Error desconocido")
        }
      })
      .catch((err) => {
        console.error("Error en el hook:", err) // 👈 Para debugging

        // Manejo más específico de errores
        if (err.response?.status === 401) {
          setError("No autorizado - verifica tu sesión")
        } else if (err.response?.status === 404) {
          setError("Endpoint no encontrado")
        } else if (err.response?.data?.msg) {
          setError(err.response.data.msg)
        } else {
          setError("Error al obtener las estadísticas")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rango])

  return { data, loading, error }
}
