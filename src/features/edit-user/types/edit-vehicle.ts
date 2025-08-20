// types/vehiculos.ts

export interface Vehiculo {
  id: string
  userId: string
  marca: string
  modelo: string
  año: number
  placa: string
  color: string
  tipoVehiculo: 'auto' | 'moto' | 'camion' | 'furgoneta'
  numeroMotor?: string
  numeroChasis?: string
  fechaRegistro: string
  isActive: boolean
  propietario?: {
    nombre: string
    email: string
  }
}

export interface VehiculoFormData {
  marca: string
  modelo: string
  año: number
  placa: string
  color: string
  tipoVehiculo: 'auto' | 'moto' | 'camion' | 'furgoneta'
  numeroMotor?: string
  numeroChasis?: string
}

export interface VehiculosResponse {
  data: Vehiculo[]
  total: number
  page: number
  limit: number
}

export interface VehiculoResponse {
  data: Vehiculo
  message: string
}

export interface CreateVehiculoRequest {
  marca: string
  modelo: string
  año: number
  placa: string
  color: string
  tipoVehiculo: string
  numeroMotor?: string
  numeroChasis?: string
}

export type UpdateVehiculoRequest = Partial<CreateVehiculoRequest>

// Tipos para filtros y búsqueda
export interface VehiculosFilters {
  search?: string
  marca?: string
  tipoVehiculo?: string
  año?: number
  isActive?: boolean
  page?: number
  limit?: number
}

// Tipos para errores
export interface VehiculosError {
  message: string
  status?: number  // Hacer status opcional
  field?: string
}

// Tipo para errores de la API específicamente
export interface APIError extends VehiculosError {
  status: number  // Requerido para errores de API
}