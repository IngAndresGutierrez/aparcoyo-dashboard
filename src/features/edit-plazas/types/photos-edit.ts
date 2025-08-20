// types/plaza-photos.types.ts

// Tipo para las fotos individuales
export interface Foto {
  id: string
  url: string
  alt: string
  principal?: boolean
}

// Tipo para los datos completos de fotos de una plaza
export interface PlazaPhotosData {
  id: string
  fotos: Foto[]
}

// Props para el componente PlazaPhotos
export interface PlazaPhotosProps {
  plazaId?: string
  photosData?: PlazaPhotosData
  onEditar?: () => void
  onAgregarFoto?: (file: File) => void
  onEliminarFoto?: (fotoId: string) => void
}

// Props para el modal de edición
export interface EditPhotosModalProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  onSave: (photos: string[]) => void
  maxPhotos?: number
}