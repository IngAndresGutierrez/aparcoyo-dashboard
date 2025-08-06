// types/range.ts - Actualización con tipos específicos

export interface PlazaPropietario {
  uid: string
  nombre: string
}

export interface PlazaDetalle {
  id: string
  nombre: string
  precio: number
  fechaPublicacion: string
  ciudad: string
  tipo: string
  reservas: number
  propietario: PlazaPropietario
}

export interface PrecioPromedioPorTipo {
  tipo: string
  precioPromedio: number
}

export interface PrecioPromedioPorCiudad {
  ciudad: string
  precioPromedio: number
}

export interface EstadisticasBackendResponse {
  plazasPublicadas: number
  plazasInmediatas: number
  plazasPrivadas: number
  precioPromedioPorTipo: PrecioPromedioPorTipo[]
  precioPromedioPorCiudad: PrecioPromedioPorCiudad[]
  plazasDetalle: PlazaDetalle[]
}