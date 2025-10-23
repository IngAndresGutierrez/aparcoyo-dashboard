/* eslint-disable @typescript-eslint/no-explicit-any */
// types/header-plaza.ts

// Interfaz que coincide EXACTAMENTE con lo que devuelve tu backend
export interface PlazaDetailResponse {
  id: string
  nombre: string
  descripcion: string
  direccion: string
  precio: string
  tipo: "Privada" | "Inmediata" | "Publica"
  disponible: boolean
  usuarioId: string
  reservas: any[]
  reseñas: any[]
  createdAt: string
  updatedAt: string

  // ✅ Campo de imágenes del backend
  img?: Array<{
    id: string
    url: string
    tipo: string
    nombre: string
    tamaño: number
    createdAt: string
  }>

  // Mantener compatibilidad con código anterior
  imagen?: string
  activa?: boolean
}

// Respuesta adaptada (lo que esperamos después de procesar)
export interface PlazasUsuarioResponse {
  plazas: PlazaDetailResponse[]
  total: number
  usuario: {
    uid: string
    nombre: string
  }
}

// Interfaz para el componente PlazaHeader
export interface PlazaHeaderData {
  id: string
  nombre: string
  tipo: "privada" | "publica" | "inmediata"
  imagen?: string
  img?: Array<{
    id: string
    url: string
    tipo: string
    nombre: string
    tamaño: number
    createdAt: string
  }>
  precio?: number
  ciudad?: string
  ubicacion?: string
  disponible?: boolean
  descripcion?: string
  reservas?: number
}

// Función para adaptar la respuesta del backend al formato del componente
export const adaptPlazaForHeader = (
  plaza: PlazaDetailResponse
): PlazaHeaderData => {
  // ✅ Obtener la primera imagen del array img
  const primeraImagen = plaza.img?.[0]?.url || plaza.imagen

  return {
    id: plaza.id,
    nombre: plaza.nombre,
    tipo: plaza.tipo.toLowerCase() as "privada" | "publica" | "inmediata",
    imagen: primeraImagen, // ✅ Usar la primera imagen del backend
    img: plaza.img, // ✅ Mantener el array completo
    precio: plaza.precio ? parseFloat(plaza.precio) : undefined,
    ciudad: plaza.direccion,
    ubicacion: plaza.direccion,
    disponible: plaza.disponible,
    descripcion: plaza.descripcion,
    reservas: plaza.reservas?.length || 0,
  }
}
