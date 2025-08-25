import React, { useState, useEffect } from "react"
import { Trash2, Plus,  Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface EditPhotosModalProps {
  isOpen: boolean
  onClose: () => void
  photos: string[]
  onSave: (photos: string[]) => void
}

interface PhotoItem {
  id: string
  url: string
  file?: File
  isLocal: boolean
}

const EditPhotosModal = ({
  isOpen,
  onClose,
  photos: initialPhotos,
  onSave,
}: EditPhotosModalProps) => {
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([])
  const [isClient, setIsClient] = useState(false) // Nuevo estado

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Inicializar fotos cuando se abra el modal
  useEffect(() => {
    if (isOpen && isClient) {
      const items = initialPhotos.map((url, index) => ({
        id: `initial-${index}`,
        url,
        isLocal: false
      }))
      setPhotoItems(items)
    }
  }, [isOpen, initialPhotos, isClient])

  // Limpiar URLs de objetos cuando se cierre
  useEffect(() => {
    // Ya no necesitamos limpiar URLs porque usamos Base64
    return () => {
      // Cleanup opcional si es necesario
    }
  }, [])

  const handleDeletePhoto = (id: string) => {
    setPhotoItems(prev => prev.filter(item => item.id !== id))
  }

  const handleAddPhoto = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = false

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Validar tamaño (máximo 10MB para demo)
      if (file.size > 10 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 10MB.")
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert("Solo se permiten archivos de imagen.")
        return
      }

      try {
        // Convertir inmediatamente a Base64 en lugar de usar blob URL
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const newItem: PhotoItem = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID más consistente
          url: base64Url, // Usar Base64 directamente
          file,
          isLocal: true
        }

        setPhotoItems(prev => [...prev, newItem])
        console.log("✅ Archivo convertido a Base64:", file.name, "Tamaño:", (file.size / 1024).toFixed(1) + "KB")
      } catch (error) {
        console.error("Error convirtiendo archivo:", error)
        alert("Error procesando la imagen")
      }
    }

    input.click()
  }

  const handleSave = async () => {
    // Como ya convertimos todo a Base64, solo necesitamos las URLs
    const processedPhotos = photoItems.map(item => item.url)

    onSave(processedPhotos)
    onClose()
  }

  const handleCancel = () => {
    // Ya no hay URLs temporales que limpiar
    onClose()
  }

  // Crear algunas fotos mock si no hay fotos iniciales (para demo)
  const mockPhotos = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=400&fit=crop&crop=center"
  ]

  const displayItems = photoItems.length === 0 && initialPhotos.length === 0 
    ? mockPhotos.map((url, index) => ({
        id: `mock-${index}`,
        url,
        isLocal: false
      }))
    : photoItems

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Editar fotos
            </DialogTitle>
          </div>
        </div>

        {/* Grid de fotos */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-3 gap-4">
            {displayItems.map((item, index) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                  <Image
                    src={item.url}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      console.error("Error cargando imagen:", item.url)
                      // Mostrar placeholder en caso de error
                      const target = e.target as HTMLImageElement
                      target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03MCA3MEgxMzBWMTMwSDcwVjcwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K"
                    }}
                    sizes="(max-width: 768px) 33vw, 150px"
                  />
                  
                  {/* Badge para fotos locales */}
                  {item.isLocal && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                      Nuevo
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePhoto(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {/* Botón agregar foto */}
            {displayItems.length < 6 && (
              <button
                onClick={handleAddPhoto}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Agregar</span>
              </button>
            )}
          </div>

          {/* Info sobre archivos locales */}
          {displayItems.some(item => item.isLocal) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  ✅ Archivos convertidos a Base64
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Las imágenes ya están listas para guardar permanentemente
              </p>
            </div>
          )}

          {/* Info de demo */}
          {displayItems.length > 0 && !photoItems.length && initialPhotos.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm text-yellow-700">
                📸 Fotos de demostración - Agrega tus propias imágenes
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {displayItems.length}/6 fotos
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="px-6">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 bg-green-600 hover:bg-green-700 shadow-sm"
            >
              💾 Guardar permanentemente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditPhotosModal