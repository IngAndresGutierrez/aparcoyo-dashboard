// types/reservas-table.ts
export interface ReservaTable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any
  usuario: string
  plaza: string
  matricula: string
  fechaInicio: string // ISO string
  fechaFin: string // ISO string
}

export interface ReservasTableResponse {
  data: ReservaTable[]
  // Si el backend devuelve metadata adicional:
  total?: number
  page?: number
  limit?: number
}