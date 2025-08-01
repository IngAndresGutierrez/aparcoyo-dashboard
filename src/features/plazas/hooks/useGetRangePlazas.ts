import { useEffect, useState, useCallback, useRef } from "react"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
import { EstadisticasBackendData } from "../types/range"

export const usePlazasStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasBackendData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para hacer refetch manual
  const refetch = useCallback(() => {
    setError(null)
    setLoading(true)
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()
    
    getPlazasStatsByRangeServiceAlt(rango, abortControllerRef.current.signal)
      .then((res) => {
        console.log(`Respuesta del backend (${rango}):`, res.data)
        
        if (res.data.ok && res.data.data) {
          setData(res.data.data)
          setError(null)
        } else {
          setError(res.data.msg || "Error desconocido")
          setData(null)
        }
      })
      .catch((err) => {
        // No mostrar error si la petición fue cancelada
        if (err.name === 'AbortError') {
          console.log(`Petición cancelada para rango: ${rango}`)
          return
        }
        
        console.error(`Error en el hook (${rango}):`, err)
        
        // Manejo más específico de errores
        let errorMessage = "Error al obtener las estadísticas"
        
        if (err.response?.status === 401) {
          errorMessage = "No autorizado - verifica tu sesión"
        } else if (err.response?.status === 404) {
          errorMessage = "Endpoint no encontrado"
        } else if (err.response?.status === 500) {
          errorMessage = "Error interno del servidor"
        } else if (err.response?.status === 429) {
          errorMessage = "Demasiadas peticiones - intenta más tarde"
        } else if (err.response?.data?.msg) {
          errorMessage = err.response.data.msg
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        setData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rango])

  useEffect(() => {
    refetch()
    
    // Cleanup: cancelar petición al desmontar o cambiar rango
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  return { 
    data, 
    loading, 
    error, 
    refetch // Exponer función para refetch manual
  }
}