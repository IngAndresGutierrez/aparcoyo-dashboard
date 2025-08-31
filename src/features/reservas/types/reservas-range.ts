/* eslint-disable @typescript-eslint/no-explicit-any */
// types/reservas-range.ts

export interface ReservaDetalle {
  ubicacion: string
  id: string
  plaza: string
  precio: number
  ciudad: string
  usuario: string
  email: string
  fechaInicio: string
  fechaFin: string
  estado: string
}

export interface PlazaMasReservada {
  count: number
  cantidad: number
  plaza: string
  name: any
  nombre: string
  totalReservas: number
}

export interface ReservasPorCiudad {
  cantidad: number
  count: any
  ubicacion: string
  name: string
  ciudad: string
  totalReservas: number
}

// NUEVA estructura que coincide con la respuesta real
export interface EstadisticasReservasResponse {
  reservasTotal: number
  plazasInmediatas: number
  plazasPrivadas: number
  plazasConReservaActiva: number
  reservasCanceladas: number
  plazasMasReservadas: PlazaMasReservada[]
  reservasPorCiudad: ReservasPorCiudad[]
  reservasDetalle: ReservaDetalle[]
}

// Types para las gráficas (actualizados)
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
