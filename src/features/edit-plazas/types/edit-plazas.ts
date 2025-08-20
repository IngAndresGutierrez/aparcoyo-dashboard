// types/modal-plaza.types.ts
// Tipos específicos para el modal de edición de plazas

export interface PlazaModal {
  id: string
  titulo: string
  descripcion: string
  precio: number
  propietario: {
    id: string
    nombre: string    // ✅ Solo "nombre" (sin "name")
    email: string
  }
}

export interface ActualizarPlazaModal {
  titulo: string
  descripcion: string
  precio: number
  propietarioId: string
}

// Tipo para las respuestas de la API
export interface PlazaModalResponse {
  success: boolean
  data: PlazaModal
  message?: string
}

// Tipo para errores de la API
export interface PlazaModalError {
  success: false
  error: string
  message: string
  statusCode: number
}

// Tipo para propietarios disponibles
export interface PropietarioModal {
  id: string
  nombre: string
  email: string
  avatar?: string
}

// Tipo para props del modal
export interface ModalDetallesPlazaProps {
  isOpen: boolean
  onClose: () => void
  plazaId: string
  onSuccess?: () => void
  propietarios?: PropietarioModal[]
}

// Tipo para el estado del formulario interno
export interface FormDataModal {
  titulo: string
  descripcion: string
  precio: number
  propietario: {
    id: string
    nombre: string
    email: string
  }
}

// Tipo para errores de validación
export interface ValidationErrors {
  [key: string]: string
}