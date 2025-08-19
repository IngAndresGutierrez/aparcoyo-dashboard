// types/reportes.ts

export interface ReporteMetrics {
  totalReportes: number;
  pendientes: number;
  resueltos: number;
  cancelados: number;
}

export interface Usuario {
  uid: string;
  nombre: string;
}

export interface Reporte {
  id: string;
  descripcion: string;
  categoria: string;
  categoriaLabel: string;
  estado: string;
  fecha: string;
  resolvedAt: string | null;
  respuestaAdmin: string | null;
  usuario: Usuario;
  resolvedBy: Usuario | null;
}

export interface ReportePagination {
  page: number;
  limit: number;
  total: number;
}

export interface ReportesData {
  metrics: ReporteMetrics;
  reportes: Reporte[];
  pagination: ReportePagination;
}

export interface ReportesResponse {
  ok: boolean;
  data: ReportesData;
  msg: string;
}

// Tipos para el endpoint de lista de reportes (estructura real)
export interface ReportesListResponse {
  ok: boolean;
  data: Reporte[];  // Es un array directo, no un objeto con reportes
  msg: string;
}

// Tipos para categorías
export interface ReporteCategoria {
  value: string;
  label: string;
}

export interface ReportesCategoriasResponse {
  ok: boolean;
  data: ReporteCategoria[];
  msg: string;
}

// Parámetros para filtros y paginación
export interface ReportesFilters {
  page?: number;
  limit?: number;
  estado?: string;
  categoria?: string;
  fechaInicio?: string;
  fechaFin?: string;
}