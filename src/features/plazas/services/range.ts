/* eslint-disable @typescript-eslint/no-unused-vars */
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
    
    console.log('🔐 Token encontrado:', token ? 'Sí' : 'No')
    
    // ✅ Nueva estructura: usar query parameters en lugar de path parameters
    const url = `${BASE_URL}/plazas/estadisticas`
    console.log('🌐 URL base:', url)
    console.log('📊 Rango solicitado:', rango)
    
    const response = await axios.get<EstadisticasBackendResponse>(
      url,
      {
        signal,
        timeout: 30000,
        // ✅ Agregar el rango como query parameter
        params: {
          rango: rango  // Esto convertirá la URL a: /apa/plazas/estadisticas?rango=mes
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: false,
      }
    )
    
    console.log('✅ Respuesta exitosa:', {
      status: response.status,
      dataStructure: Object.keys(response.data),
      plazasPublicadas: response.data.plazasPublicadas,
      plazasPrivadas: response.data.plazasPrivadas,
      totalDetalles: response.data.plazasDetalle?.length || 0
    })
    
    // ✅ Validar que la respuesta tenga la estructura esperada
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Respuesta del servidor inválida: datos faltantes')
    }
    
    if (typeof response.data.plazasPublicadas !== 'number') {
      console.warn('⚠️ Estructura de datos inesperada:', response.data)
    }
    
    return response
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error en servicio:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      params: error.config?.params,
    })
    
    // ✅ Manejo específico de errores
    if (error.response?.status === 401) {
      console.error('🚫 Token inválido o expirado')
      // Opcional: redirigir al login o limpiar token
      // localStorage.removeItem('token')
    } else if (error.response?.status === 404) {
      console.error('🔍 Endpoint no encontrado - verificar query parameters')
    } else if (error.response?.status === 403) {
      console.error('🚫 Sin permisos para acceder al recurso')
    } else if (error.response?.status === 400) {
      console.error('📝 Parámetros inválidos - verificar que el rango sea correcto')
    }
    
    throw error
  }
}

// ✅ Función para probar específicamente el endpoint de estadísticas
export const testEstadisticasEndpoint = async (rango: "dia" | "semana" | "mes" = "mes") => {
  try {
    const token = localStorage.getItem('token')
    console.log('🧪 Probando endpoint de estadísticas...')
    console.log('📊 Rango:', rango)
    console.log('🔐 Token:', token ? 'Presente' : 'Ausente')
    
    const response = await axios.get(`${BASE_URL}/plazas/estadisticas`, {
      params: { rango },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })
    
    console.log('✅ Estadísticas obtenidas:', {
      status: response.status,
      dataKeys: Object.keys(response.data),
      sample: response.data
    })
    
    return response.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error al probar estadísticas:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    })
    throw error
  }
}

// ✅ Función para verificar el token
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No token found')
    }
    
    // Probar con un endpoint que requiera autenticación
    const response = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000,
    })
    
    console.log('✅ Token válido')
    return true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Token inválido:', error.message)
    return false
  }
}