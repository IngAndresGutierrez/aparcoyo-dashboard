// services/range.ts
import axios from 'axios'
import { EstadisticasBackendResponse } from '../types/range'

const BASE_URL = "https://aparcoyo-back.onrender.com/apa"

export const getPlazasStatsByRangeServiceAlt = async (
  rango: "dia" | "semana" | "mes",
  signal?: AbortSignal
) => {
  try {
    // ✅ Obtener el token del localStorage
    const token = localStorage.getItem('token')
    
    console.log('🔐 Token encontrado:', token ? 'Sí' : 'No') // Para debug
    
    const response = await axios.get<EstadisticasBackendResponse>(
      `${BASE_URL}/plazas/estadisticas/${rango}`,
      {
        signal,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Agregar token
        }
      }
    )
    
    return response
  } catch (error) {
    console.error('❌ Error en servicio:', error)
    throw error
  }
}