import { EstadisticasBackendResponse } from "../types/range"

// URL base de tu API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

/**
 * Servicio para obtener estadísticas de plazas por rango de tiempo
 * Específicamente diseñado para el análisis por ciudades
 * Endpoint: /api/plazas/estadisticas
 */
export const getPlazasStatsByRangeServiceAlt = async (
  rango: "dia" | "semana" | "mes",
  signal?: AbortSignal
): Promise<{ data: EstadisticasBackendResponse }> => {
  try {
    // Construir la URL del endpoint correcto
    const endpoint = `${API_BASE_URL}/api/plazas/estadisticas`
    
    console.log(`🔄 Llamando al servicio de ciudades: ${endpoint}?rango=${rango}`)

    const response = await fetch(`${endpoint}?rango=${rango}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Si necesitas autenticación, descomenta y ajusta:
        // "Authorization": `Bearer ${getAuthToken()}`,
      },
      signal, // Para poder cancelar la petición
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      throw new Error(
        errorData.message || 
        `Error ${response.status}: ${response.statusText}`
      )
    }

    const data: EstadisticasBackendResponse = await response.json()
    
    console.log(`✅ Datos recibidos del servicio de ciudades:`, {
      rango,
      totalPlazas: data.plazasDetalle?.length || 0,
      endpoint
    })

    return { data }
    
  } catch (error) {
    // Si la petición fue cancelada, no logueamos como error
    if (error instanceof Error && error.name === "AbortError") {
      console.log(`🚫 Petición cancelada para rango: ${rango}`)
      throw error
    }

    console.error(`❌ Error en getPlazasStatsByRangeServiceAlt:`, {
      rango,
      error: error instanceof Error ? error.message : error,
      endpoint: `${API_BASE_URL}/api/plazas/estadisticas?rango=${rango}`
    })
    
    throw error
  }
}