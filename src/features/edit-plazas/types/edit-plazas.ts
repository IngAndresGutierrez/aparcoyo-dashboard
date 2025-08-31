/* eslint-disable @typescript-eslint/no-explicit-any */
// types/modal-plaza.types.ts

export interface PlazaModal {
  id: string
  nombre: string
  descripcion: string
  tipo: string
  direccion: string
  lat: number
  lng: number
  precio: string
  // CAMPOS DE FECHA AGREGADOS:
  disponibilidadDesde: string // ISO string: "2025-08-29T17:36:31.420Z"
  disponibilidadHasta: string // ISO string: "2025-09-28T17:36:31.420Z"
  isActive: boolean // Faltaba este campo también
  // IMÁGENES:
  img: Array<{
    id: string
    url: string
    tipo: string
    nombre: string | null
    tamaño: string | null
    createAt: string // Esta es otra fecha disponible
  }>
  propietario: {
    uid: string
    nombre: string
    email?: string // El email puede no estar en la respuesta del backend
  }
  resenas: any[]
  cantidadResenas: number
  rating: number
}

export interface PlazaModalResponse {
  ok: boolean
  data: PlazaModal
  msg: string
}

// Para actualizar (probablemente diferente del GET)
export interface ActualizarPlazaModal {
  nombre: string
  descripcion: string
  precio: string
  propietarioUid: string
  tipo?: string
  direccion?: string
  lat?: number
  lng?: number
  // CAMPOS DE FECHA OPCIONALES PARA ACTUALIZAR:
  disponibilidadDesde?: string
  disponibilidadHasta?: string
  isActive?: boolean
}

export interface FormDataModal {
  nombre: string
  descripcion: string
  precio: number // Para el frontend usamos number
  propietario: {
    id: string // Para el frontend usamos id (será el uid del backend)
    nombre: string
    email: string
  }
}
