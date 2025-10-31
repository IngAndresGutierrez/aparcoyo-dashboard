export interface DatosBancarios {
  cuentaBancaria: string
  titularCuenta: string
  nombreBanco: string
}

export interface Banco {
  id: string
  nombre: string
  codigo?: string
}

export interface RetiroRequest {
  monto: number
}

export interface Retiro {
  id: string
  monto: number
  fecha: string
  estado: "pendiente" | "completado" | "fallido"
  cuentaDestino?: string
}

export interface Saldo {
  saldoTotal: number
  saldoGanado: number
  saldoRecargado: number
  puedeRetirar: boolean
  montoMinimoRetiro: number
}

export interface ComisionPendiente {
  id: string
  monto: number
  fecha: string
}

export interface ComisionesPendientesResponse {
  admin: {
    uid: string
    nombre: string
    email: string
    saldoActual: number
  }
  totalPendiente: number
  cantidadComisiones: number
  comisiones: ComisionPendiente[]
}
