// ============================================
// 📁 types/usuariosTabla.ts
// ============================================

export interface UsuarioTabla {
  uid: string
  nombre: string
  email: string
  telefono?: string
  fechaRegistro: string
  estado: "activo" | "inactivo" | "suspendido"
  totalReservas: number
  totalPlazas: number
  ultimaActividad?: string
  verificado: boolean
  rol?: "usuario" | "admin" | "moderador"
  isActive: boolean
}

export interface UsuariosTablaResponse {
  ok: boolean
  data: UsuarioTabla[]
  msg: string
  total?: number
  page?: number
  limit?: number
}

export interface UsuariosTablaParams {
  page?: number
  limit?: number
  search?: string
  estado?: "activo" | "inactivo" | "suspendido"
  sortBy?: "nombre" | "email" | "fechaRegistro" | "totalReservas"
  sortOrder?: "asc" | "desc"
}
