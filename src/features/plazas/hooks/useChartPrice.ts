// hooks/useChartType.ts
import { useEffect, useState, useCallback, useRef } from "react"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
import {
  EstadisticasBackendResponse,
  PrecioPromedioPorTipo,
  PlazaDetalle,
} from "../types/range"

// Definir el tipo aquí mismo o importarlo desde un archivo separado
interface TypeChartDataPoint {
  tipo: string
  averagePrice: number
  count: number
  displayName: string
}

export const usePlazasTypeStats = (rango: "dia" | "semana" | "mes") => {
  const [data, setData] = useState<EstadisticasBackendResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [typeData, setTypeData] = useState<TypeChartDataPoint[]>([])

  // Ref para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para procesar datos por tipo usando precioPromedioPorTipo
  const processTypeData = useCallback(
    (
      precioPromedioPorTipo: PrecioPromedioPorTipo[],
      plazasDetalle: PlazaDetalle[]
    ): TypeChartDataPoint[] => {
      console.log("🔍 precioPromedioPorTipo recibido:", precioPromedioPorTipo)
      console.log("🔍 plazasDetalle para contar:", plazasDetalle)

      if (!precioPromedioPorTipo || !Array.isArray(precioPromedioPorTipo)) {
        console.log("❌ precioPromedioPorTipo no es un array válido")
        return []
      }

      // Contar plazas por tipo para obtener el count
      const plazasPorTipo =
        plazasDetalle?.reduce(
          (acc: Record<string, number>, plaza: PlazaDetalle) => {
            const tipo = plaza.tipo || "Sin tipo"
            acc[tipo] = (acc[tipo] || 0) + 1
            return acc
          },
          {}
        ) || {}

      console.log("📊 Plazas por tipo:", plazasPorTipo)

      // Procesar datos ya calculados por el backend
      const typeDataArray = precioPromedioPorTipo
        .map((item) => {
          const tipo = item.tipo || "Sin tipo"
          return {
            tipo: tipo,
            averagePrice: Math.round(item.precioPromedio || 0),
            count: plazasPorTipo[tipo] || 0,
            displayName: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          }
        })
        .filter((item) => item.count > 0) // Solo tipos con plazas
        .sort((a, b) => b.averagePrice - a.averagePrice) // Ordenar por precio promedio descendente

      console.log("📈 Array final de tipos:", typeDataArray)

      return typeDataArray
    },
    []
  )

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
        console.log(`✅ Respuesta del backend para tipos (${rango}):`, res.data)

        if (res.data && typeof res.data === "object") {
          // Usar precioPromedioPorTipo del backend
          const processedTypeData = processTypeData(
            res.data.precioPromedioPorTipo,
            res.data.plazasDetalle
          )

          console.log(`📊 Datos de tipos procesados:`, {
            totalTypes: processedTypeData.length,
            topType: processedTypeData[0]?.tipo,
            topTypePrice: processedTypeData[0]?.averagePrice,
          })

          setData(res.data)
          setTypeData(processedTypeData)
          setError(null)
        } else {
          setError("Respuesta inválida del servidor")
          setData(null)
          setTypeData([])
        }
      })
      .catch((err) => {
        // No mostrar error si la petición fue cancelada
        if (err.name === "AbortError") {
          console.log(`🚫 Petición de tipos cancelada para rango: ${rango}`)
          return
        }

        console.error(`❌ Error en el hook de tipos (${rango}):`, err)

        let errorMessage = "Error al obtener las estadísticas de tipos"

        if (err.response?.status === 401) {
          errorMessage = "No autorizado - verifica tu sesión"
        } else if (err.response?.status === 404) {
          errorMessage = "Endpoint no encontrado"
        } else if (err.response?.status === 500) {
          errorMessage = "Error interno del servidor"
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
        setData(null)
        setTypeData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [rango, processTypeData])

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
    refetch,
    typeData, // Datos procesados para el gráfico

    // Stats adicionales
    stats: data
      ? {
          totalTypes: typeData.length,
          topType: typeData[0]?.tipo || "N/A",
          topTypePrice: typeData[0]?.averagePrice || 0,
          averagePrice:
            typeData.length > 0
              ? Math.round(
                  typeData.reduce((sum, type) => sum + type.averagePrice, 0) /
                    typeData.length
                )
              : 0,
          // Stats específicas del backend
          totalPlazas:
            (data.plazasPublicadas || 0) +
            (data.plazasPrivadas || 0) +
            (data.plazasInmediatas || 0),
          plazasPublicadas: data.plazasPublicadas || 0,
          plazasPrivadas: data.plazasPrivadas || 0,
          plazasInmediatas: data.plazasInmediatas || 0,
        }
      : null,
  }
}
