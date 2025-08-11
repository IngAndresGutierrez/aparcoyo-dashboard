export interface UsuarioDetalle {
  nombre: string
  email: string
  fechaRegistro: string
  reservasHechas: number
  plazasPublicadas: number
}

export interface UsuarioEstadisticas {
  usuariosNuevos: number
  usuariosConPlaza: number
  usuariosConReserva: number
  usuariosTotales: number
  periodoActual: number
  periodoAnterior: number
  usuarios: UsuarioDetalle[]
}

export interface UsuarioEstadisticasResponse {
  ok: boolean // ← CORRECTO: el API devuelve 'ok'
  data: UsuarioEstadisticas
  msg: string // ← CORRECTO: el API devuelve 'msg'
}

export type RangoEstadisticas = "dia" | "semana" | "mes"
