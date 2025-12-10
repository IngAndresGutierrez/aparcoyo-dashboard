/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react"
import { getPlazasStatsByRangeServiceAlt } from "../services/range"
import {
  EstadisticasBackendResponse,
  PrecioPromedioPorTipo,
  PlazaDetalle,
} from "../types/range"

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

  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  const processTypeData = useCallback(
    (
      precioPromedioPorTipo: PrecioPromedioPorTipo[],
      plazasDetalle: PlazaDetalle[]
    ): TypeChartDataPoint[] => {
      console.log("🔍 === INICIO PROCESAMIENTO ===")
      console.log("🔍 precioPromedioPorTipo:", precioPromedioPorTipo)
      console.log("🔍 plazasDetalle:", plazasDetalle)

      // ✅ VALIDACIÓN 1: Verificar que precioPromedioPorTipo existe y es array
      if (!precioPromedioPorTipo || !Array.isArray(precioPromedioPorTipo)) {
        console.error("❌ precioPromedioPorTipo no es un array válido")
        return []
      }

      // ✅ VALIDACIÓN 2: Si precioPromedioPorTipo está vacío
      if (precioPromedioPorTipo.length === 0) {
        console.warn("⚠️ precioPromedioPorTipo está vacío")
        return []
      }

      // ✅ MEJORA: Normalizar tipos para comparación (sin espacios, lowercase)
      const normalizarTipo = (tipo: string) =>
        tipo?.trim().toLowerCase().replace(/\s+/g, " ") || "sin tipo"

      // Contar plazas por tipo NORMALIZADO
      const plazasPorTipo =
        plazasDetalle?.reduce(
          (acc: Record<string, number>, plaza: PlazaDetalle) => {
            const tipoNormalizado = normalizarTipo(plaza.tipo)
            acc[tipoNormalizado] = (acc[tipoNormalizado] || 0) + 1
            return acc
          },
          {}
        ) || {}

      console.log("📊 Plazas por tipo (normalizado):", plazasPorTipo)

      // ✅ MEJORA: Procesar sin filtrar por count si no hay plazasDetalle
      const usarCountDesdePrecioPromedio =
        !plazasDetalle || plazasDetalle.length === 0

      const typeDataArray = precioPromedioPorTipo
        .map((item, index) => {
          const tipo = item.tipo || "Sin tipo"
          const tipoNormalizado = normalizarTipo(tipo)

          // Si no hay plazasDetalle, usar un count de 1 para mostrar al menos el precio promedio
          const count = usarCountDesdePrecioPromedio
            ? 1
            : plazasPorTipo[tipoNormalizado] || 0

          console.log(
            `   Tipo ${index}: "${tipo}" -> count: ${count}, precio: ${item.precioPromedio}`
          )

          return {
            tipo: tipo,
            averagePrice: Math.round(item.precioPromedio || 0),
            count: count,
            displayName: tipo.charAt(0).toUpperCase() + tipo.slice(1),
          }
        })
        // ✅ CAMBIO CRÍTICO: Solo filtrar si NO usamos count desde precio promedio
        .filter((item) => usarCountDesdePrecioPromedio || item.count > 0)
        .sort((a, b) => b.averagePrice - a.averagePrice)

      console.log("📈 Array final de tipos:", typeDataArray)
      console.log(`✅ Total tipos procesados: ${typeDataArray.length}`)
      console.log("🔍 === FIN PROCESAMIENTO ===")

      return typeDataArray
    },
    []
  )

  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return

    setError(null)
    setLoading(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const res = await getPlazasStatsByRangeServiceAlt(
        rango,
        abortControllerRef.current.signal
      )

      if (!isMountedRef.current) return

      console.log(`✅ Respuesta completa del backend (${rango}):`, res.data)

      // ✅ VALIDACIÓN: Verificar estructura de respuesta
      if (!res.data || typeof res.data !== "object") {
        console.error("❌ Respuesta inválida del servidor:", res)
        setError("Respuesta inválida del servidor")
        setData(null)
        setTypeData([])
        return
      }

      // ✅ VALIDACIÓN: Verificar que precioPromedioPorTipo existe
      if (!res.data.precioPromedioPorTipo) {
        console.error(
          "❌ No se encontró 'precioPromedioPorTipo' en la respuesta"
        )
        console.log("📦 Keys disponibles:", Object.keys(res.data))
        setError("Datos de tipos no disponibles en la respuesta")
        setData(null)
        setTypeData([])
        return
      }

      const processedTypeData = processTypeData(
        res.data.precioPromedioPorTipo,
        res.data.plazasDetalle
      )

      console.log(`📊 Resultado final:`, {
        totalTypes: processedTypeData.length,
        topType: processedTypeData[0]?.tipo,
        topTypePrice: processedTypeData[0]?.averagePrice,
      })

      setData(res.data)
      setTypeData(processedTypeData)
      setError(null)
    } catch (err: any) {
      if (!isMountedRef.current) return

      if (
        err.name === "AbortError" ||
        err.name === "CanceledError" ||
        err.message === "canceled" ||
        err.code === "ERR_CANCELED"
      ) {
        console.log(`🚫 Petición cancelada para rango: ${rango}`)
        return
      }

      console.error(`❌ Error en el hook (${rango}):`, err)

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
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [rango, processTypeData])

  useEffect(() => {
    refetch()

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [refetch])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ✅ CÁLCULO CORRECTO: Contar plazas reales por tipo desde plazasDetalle
  const calcularEstadisticasReales = useCallback(
    (data: EstadisticasBackendResponse) => {
      const plazas = data.plazasDetalle || []

      // Contar plazas por tipo (no sumar cantidades)
      const plazasPorTipo = plazas.reduce(
        (acc: Record<string, number>, plaza: PlazaDetalle) => {
          const tipo = plaza.tipo?.toLowerCase() || "sin tipo"
          acc[tipo] = (acc[tipo] || 0) + 1
          return acc
        },
        {}
      )

      console.log("📊 Conteo real de plazas por tipo:", plazasPorTipo)

      return {
        totalPlazas: plazas.length, // ✅ Total real de plazas
        plazasPublicas:
          plazasPorTipo["publica"] || plazasPorTipo["pública"] || 0,
        plazasPrivadas: plazasPorTipo["privada"] || 0,
        plazasInmediatas: plazasPorTipo["inmediata"] || 0,
      }
    },
    []
  )

  return {
    data,
    loading,
    error,
    refetch,
    typeData,

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
          // ✅ CORRECCIÓN: Usar conteo real de plazas
          ...calcularEstadisticasReales(data),
        }
      : null,
  }
}
