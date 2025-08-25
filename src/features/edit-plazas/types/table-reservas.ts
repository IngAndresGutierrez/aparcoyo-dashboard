/* eslint-disable @typescript-eslint/no-explicit-any */
// types/plaza.ts

export interface Usuario {
  id: string
  nombre: string
  email: string
  avatar?: string
  iniciales?: string
}

export interface Reserva {
  id: string
  usuario: Usuario
  fechaConfirmacion: string
  estado: "programado" | "concluida" | "cancelada"
  fechaReserva: string
  horaInicio: string
  horaFin: string
  precio: number
  comision: number
  plazaId: string
  createdAt?: string
  updatedAt?: string
}

export interface Plaza {
  reseñas(arg0: string, reseñas: any): unknown
  id: string
  nombre: string
  descripcion?: string
  ubicacion?: string
  precio: number
  disponible: boolean
  usuarioId: string
  reservas?: Reserva[] // Puede venir incluido o no según el endpoint
  createdAt: string
  updatedAt: string
  // Agregar más campos según tu API
}

// Respuesta de la API para una plaza específica (estructura flexible)
export interface PlazaApiResponse {
  // Estructura común que puede tener la API
  data?: Plaza
  plaza?: Plaza
  result?: Plaza
  // O directamente los campos de Plaza si viene sin wrapper
  id?: string
  nombre?: string
  [key: string]: any // Para campos adicionales desconocidos
}

// Para manejo de errores de la API
export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// Estados del hook
export interface UsePlazaState {
  plaza: Plaza | null
  reservas: Reserva[]
  loading: boolean
  error: ApiError | null
}

// Parámetros para ordenamiento
export interface SortParams {
  column: string
  direction: "asc" | "desc"
}

// Parámetros para filtros (si los necesitas más adelante)
export interface ReservaFilters {
  estado?: "programado" | "concluida" | "cancelada"
  fechaDesde?: string
  fechaHasta?: string
}