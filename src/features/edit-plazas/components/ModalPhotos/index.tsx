import React, { useState, useEffect } from "react"
import { Trash2, Plus, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface EditPhotosModalProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  onSave: (photos: string[]) => void
}

const EditPhotosModal = ({
  isOpen,
  onClose,
  photos: initialPhotos,
  onSave,
}: EditPhotosModalProps) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos)

  // Limpiar URLs de objetos cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      // Limpiar URLs temporales para evitar memory leaks
      photos.forEach((photo) => {
        if (photo.startsWith("blob:")) {
          URL.revokeObjectURL(photo)
        }
      })
    }
  }, [isOpen, photos])

  const handleDeletePhoto = (index: number) => {
    const photoToDelete = photos[index]

    // Si es una URL temporal, limpiarla
    if (photoToDelete.startsWith("blob:")) {
      URL.revokeObjectURL(photoToDelete)
    }

    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
  }

  const handleAddPhoto = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Crear URL temporal del archivo local
        const url = URL.createObjectURL(file)
        setPhotos([...photos, url])

        console.log("Archivo agregado:", file.name)
      }
    }

    input.click()
  }

  const handleSave = () => {
    onSave(photos)
    onClose()
  }

  const handleCancel = () => {
    // Limpiar URLs temporales que se agregaron en esta sesión
    photos.forEach((photo) => {
      if (photo.startsWith("blob:") && !initialPhotos.includes(photo)) {
        URL.revokeObjectURL(photo)
      }
    })

    setPhotos(initialPhotos) // Restaurar fotos originales
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[500px] p-0">
        {/* Header personalizado */}
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Editar fotos
            </DialogTitle>
          </div>
        </div>

        {/* Grid de fotos */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={() => {
                      console.error("Error cargando imagen:", photo)
                      // Opcional: mostrar imagen placeholder
                    }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePhoto(index)}
                  className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {/* Botón agregar foto */}
            {photos.length < 6 && (
              <button
                onClick={handleAddPhoto}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Agregar foto</span>
              </button>
            )}
          </div>

          {/* Mensaje informativo */}
          {photos.some((photo) => photo.startsWith("blob:")) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              💡 Las fotos seleccionadas se mostrarán temporalmente. Guarda para
              confirmar los cambios.
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditPhotosModal
