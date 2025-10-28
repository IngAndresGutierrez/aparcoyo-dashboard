// types/creditos.types.ts

// Respuesta base para todas las APIs
export interface ApiResponse<T> {
  ok: boolean
  data: T
  msg?: string
}

// Tipos para el balance de créditos - NUEVO FORMATO
export interface UsuarioData {
  uid: string
  nombre: string
  email: string
}

export interface SaldoData {
  saldoTotal: number
  saldoGanado: number
  saldoRecargado: number
  puedeRetirar: boolean
  montoMinimoRetiro: number
}

export interface BalanceData {
  usuario: UsuarioData
  saldo: SaldoData
}

// Tipos para editar balance
export interface EditarBalanceRequest {
  monto: number
}

export interface EditarBalanceData {
  monto: number
  nuevoBalance: string
}

// Tipos para historial de créditos (asumiendo estructura similar)
export interface CreditoHistorial {
  id: string
  monto: number
  tipo: "entrada" | "salida"
  fecha: string
  descripcion?: string
}

export interface HistorialData {
  creditos: CreditoHistorial[]
  total: number
}

// Type aliases para las respuestas (más limpio que interfaces vacías)
export type BalanceResponse = ApiResponse<BalanceData>
export type EditarBalanceResponse = ApiResponse<EditarBalanceData>
export type HistorialResponse = ApiResponse<HistorialData>

// Error type para manejo de errores
export interface ApiError {
  ok: false
  msg: string
  error?: string
}
