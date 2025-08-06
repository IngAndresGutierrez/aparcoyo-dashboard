// types/range.ts - Actualizado según la respuesta REAL del backend

export interface PropietarioInfo {
  uid: string
  nombre: string
}

export interface PlazaDetalle {
  id: string
  nombre: string
  precio: number
  fechaPublicacion: string // ISO string
  ciudad: string
  tipo: string // "Privada", "Publica", etc.
  reservas: number
  propietario: PropietarioInfo
}

// ✅ CORREGIDO: El backend devuelve "precioPromedio" (no "precio_promedio")
export interface PrecioPromedioPorTipo {
  tipo: string // "Privada", "Publica", etc.
  precioPromedio: number // ✅ Es number, no string
}

// ✅ CORREGIDO: El backend devuelve "precioPromedio" (no "precio_promedio")  
export interface PrecioPromedioPorCiudad {
  ciudad: string
  precioPromedio: number // ✅ Es number, no string
}

// ✅ RESPUESTA REAL DEL BACKEND (sin wrapper de ok/data/msg)
export interface EstadisticasBackendResponse {
  plazasPublicadas: number
  plazasInmediatas: number
  plazasPrivadas: number
  precioPromedioPorTipo: PrecioPromedioPorTipo[]
  precioPromedioPorCiudad: PrecioPromedioPorCiudad[]
  plazasDetalle: PlazaDetalle[]
}

// ✅ Si necesitas el formato anterior para mantener compatibilidad
export interface EstadisticasBackendResponseWrapper {
  ok: boolean
  data: EstadisticasBackendResponse
  msg: string | null
}

// ✅ TIPOS ANTIGUOS (por si los usas en algún lado)
export interface PlazaPorRango {
  periodo: string // fecha ISO: "2025-07-24T00:00:00.000Z"
  cantidad: string // string, aunque parece número
}

// Estructura antigua que esperabas (mantenida para compatibilidad)
export interface EstadisticasBackendDataAntigua {
  plazasPorRango: PlazaPorRango[]
  precioPromedioPorTipo: {
    tipo: string
    precio_promedio: string
  }[]
  precioPromedioPorCiudad: {
    ciudad: string
    precio_promedio: string
  }[]
}

// ✅ ADAPTADOR: Convierte la respuesta real a tu formato esperado
export const adaptarEstadisticasParaCompatibilidad = (
  responseReal: EstadisticasBackendResponse
): EstadisticasBackendDataAntigua => {
  // Generar plazasPorRango basado en plazasDetalle
  const plazasPorRango: PlazaPorRango[] = responseReal.plazasDetalle.map(plaza => ({
    periodo: plaza.fechaPublicacion,
    cantidad: "1" // Cada plaza cuenta como 1
  }))

  return {
    plazasPorRango,
    precioPromedioPorTipo: responseReal.precioPromedioPorTipo.map(item => ({
      tipo: item.tipo,
      precio_promedio: item.precioPromedio.toString()
    })),
    precioPromedioPorCiudad: responseReal.precioPromedioPorCiudad.map(item => ({
      ciudad: item.ciudad,
      precio_promedio: item.precioPromedio.toString()
    }))
  }
}

// Tipos para el componente de gráfico (mantener)
export interface ChartDataPoint {
  month: string
  desktop: number
  mobile: number
  date: string
  fullMonth: string
}

export interface GrowthData {
  percentage: string
  isPositive: boolean
}

// Estado del hook
export interface EstadisticasState {
  data: EstadisticasBackendResponse | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export type RangoEstadisticas = "dia" | "semana" | "mes"