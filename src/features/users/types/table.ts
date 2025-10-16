// ============================================
// 📁 types/usuariosTabla.ts - CORREGIDO PARA COINCIDIR CON LA API
// ============================================

// 🛠️ Interface que coincide exactamente con la respuesta de la API
export interface UsuarioAPI {
  nombre: string
  email: string
  fechaRegistro: string
  reservasHechas: number
  plazasPublicadas: number
}

// 🛠️ Interface expandida para la tabla (con campos adicionales del otro endpoint)
export interface UsuarioTabla {
  totalPlazas: number
  totalReservas: number
  uid: string
  nombre: string
  email: string
  telefono?: string
  foto?: string | null
  fechaRegistro: string
  estado?: "activo" | "inactivo" | "suspendido"
  // Cambiar estos nombres para coincidir con la API:
  reservasHechas: number // ← Era "totalReservas"
  plazasPublicadas: number // ← Era "totalPlazas"
  ultimaActividad?: string
  verificado?: boolean
  rol?: "usuario" | "admin" | "moderador" | "Usuario"
  isActive: boolean
}

// 🛠️ Response del endpoint de estadísticas de usuarios
export interface UsuariosEstadisticasResponse {
  ok: boolean
  data: {
    usuariosNuevos: number
    usuariosConPlaza: number
    usuariosConReserva: number
    usuariosTotales: number
    periodoActual: number
    periodoAnterior: number
    usuarios: UsuarioAPI[] // ← Aquí están los datos detallados
  }
  msg?: string | null
}

// 🛠️ Response del endpoint de tabla de usuarios (el que usas normalmente)
export interface UsuariosTablaResponse {
  ok: boolean
  data: UsuarioTabla[]
  msg: string | null
  total?: number
  page?: number
  limit?: number
}

// 🔥 ACTUALIZADO: Agregar filtros de fecha
export interface UsuariosTablaParams {
  page?: number
  limit?: number
  search?: string
  estado?: "activo" | "inactivo" | "suspendido"
  sortBy?:
    | "nombre"
    | "email"
    | "fechaRegistro"
    | "reservasHechas"
    | "plazasPublicadas"
  sortOrder?: "asc" | "desc"

  // 🔥 NUEVOS: Filtros de fecha para el filtrado del lado del cliente
  fechaInicio?: string // ISO string (ej: "2024-01-01T00:00:00.000Z")
  fechaFin?: string // ISO string (ej: "2024-01-31T23:59:59.999Z")
}
