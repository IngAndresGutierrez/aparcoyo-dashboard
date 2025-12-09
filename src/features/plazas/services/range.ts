/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// services/range.ts
import axios from "axios"
import { EstadisticasBackendResponse } from "../types/range"

const BASE_URL = "https://kns.aparcoyo.com/apa"

// ✅ Servicio para obtener TODAS las plazas
export const getAllPlazasService = async (signal?: AbortSignal) => {
  try {
    const token = localStorage.getItem("token")
    console.log("🔐 Token encontrado:", token ? "Sí" : "No")

    const url = `${BASE_URL}/plazas`
    console.log("🌐 Obteniendo todas las plazas de:", url)

    const response = await axios.get(url, {
      signal,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      withCredentials: false,
    })

    console.log("✅ Plazas obtenidas:", {
      status: response.status,
      total: response.data?.data?.length || 0,
    })

    return response
  } catch (error: any) {
    if (
      axios.isCancel(error) ||
      error.name === "AbortError" ||
      error.name === "CanceledError" ||
      error.message === "canceled" ||
      error.code === "ERR_CANCELED"
    ) {
      console.log("🚫 Petición de plazas cancelada")
      throw error
    }

    console.error("❌ Error al obtener plazas:", {
      message: error.message,
      status: error.response?.status,
    })

    throw error
  }
}

// ✅ CORREGIDO: Retorna TODAS las plazas en tabla, pero calcula métricas por rango
export const getPlazasStatsByRangeServiceAlt = async (
  rango: "dia" | "semana" | "mes",
  signal?: AbortSignal
) => {
  try {
    // 1. Obtener TODAS las plazas
    const response = await getAllPlazasService(signal)
    const todasLasPlazas = response.data?.data || []

    console.log("📊 Total de plazas recibidas:", todasLasPlazas.length)

    // 2. Calcular fechas del rango (solo para métricas)
    const now = new Date()
    let fechaInicio: Date

    switch (rango) {
      case "dia":
        fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "semana":
        fechaInicio = new Date(now)
        fechaInicio.setDate(now.getDate() - 7)
        break
      case "mes":
        fechaInicio = new Date(now)
        fechaInicio.setDate(now.getDate() - 30)
        break
      default:
        fechaInicio = new Date(now)
        fechaInicio.setDate(now.getDate() - 30)
    }

    // 3. ✅ Filtrar SOLO para calcular métricas del periodo
    const plazasEnRango = todasLasPlazas.filter((plaza: any) => {
      const fecha = new Date(plaza.createAt) // Usar createAt en lugar de disponibilidadDesde
      return fecha >= fechaInicio && fecha <= now
    })

    console.log(`🔍 Métricas calculadas para (${rango}):`, {
      totalPlazas: todasLasPlazas.length,
      plazasEnRango: plazasEnRango.length,
      rangoInicio: fechaInicio.toLocaleDateString("es-ES"),
      rangoFin: now.toLocaleDateString("es-ES"),
    })

    // 4. Calcular estadísticas DEL RANGO
    const plazasPublicadas = plazasEnRango.length
    const plazasInmediatas = plazasEnRango.filter(
      (p: any) => p.tipo === "Inmediata"
    ).length
    const plazasPrivadas = plazasEnRango.filter(
      (p: any) => p.tipo === "Privada"
    ).length

    // 5. Calcular promedios por tipo (DEL RANGO)
    const precioPromedioPorTipo = [
      {
        tipo: "Inmediata",
        precioPromedio:
          plazasInmediatas > 0
            ? plazasEnRango
                .filter((p: any) => p.tipo === "Inmediata")
                .reduce(
                  (sum: number, p: any) => sum + parseFloat(p.precio || 0),
                  0
                ) / plazasInmediatas
            : 0,
      },
      {
        tipo: "Privada",
        precioPromedio:
          plazasPrivadas > 0
            ? plazasEnRango
                .filter((p: any) => p.tipo === "Privada")
                .reduce(
                  (sum: number, p: any) => sum + parseFloat(p.precio || 0),
                  0
                ) / plazasPrivadas
            : 0,
      },
    ]

    // 6. Calcular promedios por ciudad (DEL RANGO, top 5)
    const preciosPorCiudad = plazasEnRango.reduce((acc: any, plaza: any) => {
      const ciudad = plaza.direccion || "Sin ciudad"
      if (!acc[ciudad]) {
        acc[ciudad] = { total: 0, count: 0 }
      }
      acc[ciudad].total += parseFloat(plaza.precio || 0)
      acc[ciudad].count++
      return acc
    }, {})

    const precioPromedioPorCiudad = Object.entries(preciosPorCiudad)
      .map(([ciudad, data]: [string, any]) => ({
        ciudad,
        precioPromedio: data.total / data.count,
      }))
      .sort((a, b) => b.precioPromedio - a.precioPromedio)
      .slice(0, 5)

    // 7. ✅ CLAVE: Retornar TODAS las plazas para la tabla
    const estadisticas: EstadisticasBackendResponse = {
      plazasPublicadas, // Métrica: plazas creadas en el rango
      plazasInmediatas, // Métrica: inmediatas en el rango
      plazasPrivadas, // Métrica: privadas en el rango
      precioPromedioPorTipo, // Métrica: promedios del rango
      precioPromedioPorCiudad, // Métrica: top ciudades del rango
      plazasDetalle: todasLasPlazas, // ✅ TODAS las plazas (35) para la tabla
    }

    console.log("✅ Estadísticas calculadas:", {
      plazasPublicadasEnPeriodo: plazasPublicadas,
      totalPlazasParaTabla: todasLasPlazas.length,
      rango,
    })

    return {
      ...response,
      data: estadisticas,
    }
  } catch (error: any) {
    if (
      axios.isCancel(error) ||
      error.name === "AbortError" ||
      error.name === "CanceledError" ||
      error.message === "canceled" ||
      error.code === "ERR_CANCELED"
    ) {
      console.log("🚫 Petición cancelada silenciosamente para rango:", rango)
      throw error
    }

    console.error("❌ Error en servicio:", {
      message: error.message,
      status: error.response?.status,
    })

    throw error
  }
}

// Función para probar específicamente el endpoint de estadísticas
export const testEstadisticasEndpoint = async (
  rango: "dia" | "semana" | "mes" = "mes"
) => {
  try {
    const token = localStorage.getItem("token")
    console.log("🧪 Probando endpoint de estadísticas...")
    console.log("📊 Rango:", rango)
    console.log("🔐 Token:", token ? "Presente" : "Ausente")

    const response = await axios.get(`${BASE_URL}/plazas/estadisticas`, {
      params: { rango },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    })

    console.log("✅ Estadísticas obtenidas:", {
      status: response.status,
      dataKeys: Object.keys(response.data),
      sample: response.data,
    })

    return response.data
  } catch (error: any) {
    if (
      axios.isCancel(error) ||
      error.name === "AbortError" ||
      error.name === "CanceledError" ||
      error.message === "canceled" ||
      error.code === "ERR_CANCELED"
    ) {
      console.log("🚫 Test de estadísticas cancelado")
      throw error
    }

    console.error("❌ Error al probar estadísticas:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params,
    })
    throw error
  }
}

// Función para verificar el token
export const validateToken = async () => {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("No token found")
    }

    const response = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    })

    console.log("✅ Token válido")
    return true
  } catch (error: any) {
    if (
      axios.isCancel(error) ||
      error.name === "AbortError" ||
      error.name === "CanceledError" ||
      error.message === "canceled" ||
      error.code === "ERR_CANCELED"
    ) {
      console.log("🚫 Validación de token cancelada")
      return false
    }

    console.error("❌ Token inválido:", error.message)
    return false
  }
}
