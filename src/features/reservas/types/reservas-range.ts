// types/reservas-range.ts
export interface ReservaDetalle {
  id: string
  fechaReserva: string
  estado: string
  precio: number
  usuario?: {
    nombre: string
    email: string
  }
  plaza?: {
    nombre: string
    ciudad: string
    tipo: string
  }
}

export interface ReservasPorEstado {
  estado: string
  cantidad: number
}

export interface ReservasPorCiudad {
  ciudad: string
  cantidad: number
}

export interface ReservasPorTipo {
  tipo: string
  cantidad: number
}

export interface EstadisticasReservasResponse {
  totalReservas: number
  reservasConfirmadas: number
  reservasPendientes: number
  reservasCanceladas: number
  reservasPorEstado: ReservasPorEstado[]
  reservasPorCiudad: ReservasPorCiudad[]
  reservasPorTipo: ReservasPorTipo[]
  reservasDetalle: ReservaDetalle[]
}

// Types para las gráficas
export interface ReservasChartDataPoint {
  estado: string
  cantidad: number
  displayName: string
}

export interface ReservasCityChartDataPoint {
  ciudad: string
  cantidad: number
  displayName: string
}

export interface ReservasTypeChartDataPoint {
  tipo: string
  cantidad: number
  displayName: string
}