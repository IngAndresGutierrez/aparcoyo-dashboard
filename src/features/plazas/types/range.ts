// types/range.ts

// Cada objeto en "plazasPorRango"
export interface PlazaPorRango {
  periodo: string; // fecha ISO: "2025-07-24T00:00:00.000Z"
  cantidad: string; // string, aunque parece número
}

// Cada objeto en "precioPromedioPorTipo"
export interface PrecioPromedioPorTipo {
  tipo: string; // ej: "Publica"
  precio_promedio: string; // string que representa un número decimal
}

// Cada objeto en "precioPromedioPorCiudad"
export interface PrecioPromedioPorCiudad {
  ciudad: string;
  precio_promedio: string;
}

// Estructura completa de la data (CORREGIDA)
export interface EstadisticasBackendData {
  plazasPorRango: PlazaPorRango[];
  precioPromedioPorTipo: PrecioPromedioPorTipo[];
  precioPromedioPorCiudad: PrecioPromedioPorCiudad[];
}

// Respuesta completa del backend (con éxito o error)
export interface EstadisticasBackendResponse {
  ok: boolean;
  data: EstadisticasBackendData;
  msg: string | null;
}

// Tipos adicionales para el componente de gráfico
export interface ChartDataPoint {
  month: string;
  desktop: number;
  mobile: number;
  date: string;
  fullMonth: string;
}

export interface GrowthData {
  percentage: string;
  isPositive: boolean;
}