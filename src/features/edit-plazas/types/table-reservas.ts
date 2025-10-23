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

// ✅ Nuevo: Tipo para las fotos que vienen del backend
export interface FotoPlaza {
  id: string
  url: string
  tipo: string // ej: "foto_plaza"
  nombre: string
  tamaño: number // tamaño en bytes
  createAt: string // Nota: el backend usa "createAt" no "createdAt"
}

// ✅ Tipo para el propietario que viene en algunas respuestas
export interface Propietario {
  uid: string
  nombre: string
  email?: string
}

// ✅ Tipo para reseñas (si las usas)
export interface Resena {
  id: string
  usuarioId: string
  plazaId: string
  calificacion: number
  comentario?: string
  createdAt: string
  updatedAt: string
}

export interface Plaza {
  id: string
  nombre: string
  descripcion?: string
  tipo?: "Privada" | "Publica" // Basado en tu respuesta del backend
  ubicacion?: string
  direccion?: string // El backend devuelve "direccion" separado de "ubicacion"
  lat?: number // Latitud
  lng?: number // Longitud
  precio: number | string // Puede venir como string "1.00"
  disponible: boolean
  isActive?: boolean // Algunos endpoints usan "isActive"
  disponibilidadDesde?: string
  disponibilidadHasta?: string
  usuarioId: string

  // ✅ Campos de relaciones que pueden venir o no según el endpoint
  reservas?: Reserva[]
  img?: FotoPlaza[] // ← Este era el campo que faltaba
  propietario?: Propietario
  reseñas?: Resena[]
  cantidadResenas?: number
  rating?: number

  // Timestamps
  createdAt: string
  updatedAt: string

  // Para compatibilidad con código legacy
  archivos?: FotoPlaza[] // Alias de img, por si algunos componentes lo usan
}

// Respuesta de la API para una plaza específica (estructura flexible)
export interface PlazaApiResponse {
  ok?: boolean
  data?: Plaza
  plaza?: Plaza
  result?: Plaza
  msg?: string
  message?: string
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

// ✅ Nuevo: Tipo para el resultado al subir fotos
export interface SubirFotosResponse {
  ok: boolean
  data: FotoPlaza[]
  msg: string
}

// ✅ Nuevo: Tipo para el resultado al eliminar fotos
export interface EliminarFotoResponse {
  ok: boolean
  data: {
    id: string
    deleted: boolean
  }
  msg: string
}
