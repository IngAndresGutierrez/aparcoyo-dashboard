// Tipos para estadísticas de plazas por rango

// Estadística individual (un punto en el tiempo)
export interface EstadisticaPunto {
  periodo: string; // "2024-01-15", "Semana 1", "Enero", etc.
  fecha: string; // fecha ISO para ordenamiento
  plazasOcupadas: number;
  plazasDisponibles: number;
  plazasTotal: number;
  ingresos: number;
  reservasNuevas: number;
}

// Datos de estadísticas agrupadas por rango
export interface EstadisticasPlazas {
  rango: "dia" | "semana" | "mes";
  fechaInicio: string;
  fechaFin: string; 
  datos: EstadisticaPunto[];
  resumen: {
    totalPlazas: number;
    promedioOcupacion: number;
    ingresosTotal: number;
    reservasTotales: number;
    tendencia: {
      porcentaje: number; // +5.2 o -2.1
      direccion: "up" | "down" | "stable";
    };
  };
}

// Respuesta completa del backend
export interface EstadisticasPlazasResponse {
  ok: boolean;
  data: EstadisticasPlazas;
  msg: string | null;
}

// Tipos auxiliares para el chart
export interface ChartDataPoint {
  periodo: string; // Para el eje X
  ocupadas: number; // Para el área 1
  disponibles: number; // Para el área 2
  ingresos?: number; // Opcional para tooltips
}

// Configuración del rango seleccionado
export type RangoEstadisticas = "dia" | "semana" | "mes";

// Posibles variaciones que podrías recibir del backend
export interface EstadisticasSimplificadas {
  rango: RangoEstadisticas;
  datos: {
    labels: string[]; // ["Lun", "Mar", "Mie"] o ["Ene", "Feb", "Mar"]
    ocupadas: number[];
    disponibles: number[];
    ingresos: number[];
  };
  total: {
    plazas: number;
    reservas: number;
    ingresos: number;
  };
}

// Response alternativa si el backend devuelve formato simplificado
export interface EstadisticasSimplificadasResponse {
  ok: boolean;
  data: EstadisticasSimplificadas;
  msg: string | null;
}