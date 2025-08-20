/* eslint-disable @typescript-eslint/no-explicit-any */
// types/modal-plaza.types.ts

export interface PlazaModal {
  id: string
  nombre: string              // Era "titulo"
  descripcion: string
  tipo: string               // Faltaba
  direccion: string          // Faltaba
  lat: number                // Faltaba
  lng: number                // Faltaba
  precio: string             // Era number, debe ser string
  propietario: {
    uid: string              // Era "id"
    nombre: string
  }
  resenas: any[]             // Faltaba - define mejor según estructura
  cantidadResenas: number    // Faltaba
  rating: number             // Faltaba
}

export interface PlazaModalResponse {
  ok: boolean                // Era "success"
  data: PlazaModal
  msg: string                // Era "message?"
}

// Para actualizar (probablemente diferente del GET)
export interface ActualizarPlazaModal {
  nombre: string             // Era "titulo"
  descripcion: string
  precio: string             // Consistente con response
  propietarioUid: string     // Era "propietarioId"
  tipo?: string
  direccion?: string
  lat?: number
  lng?: number
}