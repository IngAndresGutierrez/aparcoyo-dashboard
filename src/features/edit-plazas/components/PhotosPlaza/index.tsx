// features/edit-plazas/components/PlazaPhotos.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  Foto,
  PlazaPhotosData,
  PlazaPhotosProps,
} from "../../types/photos-edit"
import EditPhotosModal from "../ModalPhotos"

function PlazaPhotos({
  plazaId,
  photosData,
  onEditar,
  onAgregarFoto,
  onEliminarFoto,
}: PlazaPhotosProps) {
  // Estados
  const [fotoSeleccionada, setFotoSeleccionada] = useState<Foto | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isClient, setIsClient] = useState(false) // Nuevo estado para hidratación
  const [fotos, setFotos] = useState<Foto[]>(() => {
    // Solo usar datos iniciales, sin localStorage en el estado inicial
    return photosData?.fotos || []
  })

  // Efecto para marcar que estamos en el cliente y cargar desde localStorage
  useEffect(() => {
    setIsClient(true)
    
    // Cargar desde localStorage solo en el cliente
    if (plazaId) {
      const savedPhotos = localStorage.getItem(`plaza-${plazaId}-photos`)
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos)
          setFotos(parsedPhotos)
        } catch (error) {
          console.error('Error parsing saved photos:', error)
        }
      }
    }
  }, [plazaId])

  // Guardar en localStorage cuando cambien las fotos (solo en el cliente)
  useEffect(() => {
    if (isClient && plazaId && fotos.length > 0) {
      localStorage.setItem(`plaza-${plazaId}-photos`, JSON.stringify(fotos))
    }
  }, [fotos, plazaId, isClient])

  // Datos de la plaza
  const plazaPhotos: PlazaPhotosData = {
    id: plazaId || "plaza-001",
    fotos: fotos,
  }

  // Función para abrir el modal de edición
  const handleEditar = (): void => {
    setIsEditModalOpen(true)
    if (onEditar) {
      onEditar()
    }
    console.log("Abrir modal de edición para plaza:", plazaPhotos.id)
  }

  // Función para guardar fotos desde el modal (MEJORADA)
  const handleSavePhotos = (newPhotosUrls: string[]): void => {
    console.log("📥 Recibiendo fotos del modal:", newPhotosUrls)
    
    // Convertir URLs de vuelta a objetos Foto
    const newFotos: Foto[] = newPhotosUrls.map((url, index) => {
      // Verificar si ya existe esta foto para mantener su ID
      const existingFoto = fotos.find(f => f.url === url)
      
      return {
        id: existingFoto?.id || `foto-${Date.now()}-${index}`,
        url: url,
        alt: `Foto ${index + 1} del aparcamiento`,
        principal: index === 0, // Primera foto es principal
      }
    })

    setFotos(newFotos)
    console.log("✅ Fotos actualizadas y guardadas:", newFotos)

    // Aquí podrías llamar a una API para guardar en el backend
    // await updatePlazaPhotos(plazaId, newFotos)
  }

  // Función para manejar click en foto
  const handleFotoClick = (foto: Foto): void => {
    setFotoSeleccionada(foto)
  }

  // Función para manejar subida de foto directa (desde el grid) - MEJORADA
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Convertir archivo a Base64 para persistencia
      const base64Url = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      
      // Crear objeto Foto
      const nuevaFoto: Foto = {
        id: `foto-${Date.now()}`,
        url: base64Url, // Usar Base64 en lugar de blob URL
        alt: `Foto ${fotos.length + 1} del aparcamiento`,
        principal: fotos.length === 0 // Primera foto es principal
      }
      
      setFotos([...fotos, nuevaFoto])
      console.log('✅ Archivo guardado permanentemente:', file.name)
      
      if (onAgregarFoto) {
        onAgregarFoto(file)
      }
    } catch (error) {
      console.error('Error procesando archivo:', error)
    }

    // Limpiar el input
    event.target.value = ''
  }

  // Función para eliminar foto individual (desde el grid)
  const handleEliminarFoto = (fotoId: string): void => {
    const fotoAEliminar = fotos.find(foto => foto.id === fotoId)
    
    // Si es una URL temporal (blob), limpiarla
    if (fotoAEliminar?.url.startsWith('blob:')) {
      URL.revokeObjectURL(fotoAEliminar.url)
    }
    
    const nuevasFotos = fotos.filter((foto) => foto.id !== fotoId)
    setFotos(nuevasFotos)

    if (onEliminarFoto) {
      onEliminarFoto(fotoId)
    }
    console.log("Foto eliminada:", fotoId)
  }

  // Helper para determinar si una foto es Base64 (solo en cliente)
  const isFotoLocal = (foto: Foto): boolean => {
    return isClient && foto.url.startsWith('data:image/')
  }

  // Helper para determinar si una foto es temporal (solo en cliente) 
  const isFotoTemporal = (foto: Foto): boolean => {
    return isClient && foto.url.startsWith('blob:')
  }

  return (
    <>
      <Card className="w-132">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Fotos ({plazaPhotos.fotos.length}/6)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditar}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium"
            >
               Editar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {plazaPhotos.fotos.length === 0 ? (
            // Estado vacío
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">
                No hay fotos disponibles
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="upload-photo"
              />
              <label htmlFor="upload-photo">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <span className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Agregar primera foto
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            // Grid de fotos
            <div className="grid grid-cols-3 gap-3">
              {plazaPhotos.fotos.map((foto, index) => (
                <div
                  key={foto.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 ${
                    index === 0 ? "col-span-2 row-span-2" : "aspect-square"
                  }`}
                  onClick={() => handleFotoClick(foto)}
                >
                  <div
                    className={`relative ${
                      index === 0 ? "h-full min-h-[200px]" : "aspect-square"
                    }`}
                  >
                    <Image
                      src={foto.url}
                      alt={foto.alt}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        console.error('Error cargando imagen:', foto.url)
                        const target = e.target as HTMLImageElement
                        // Mostrar placeholder en caso de error
                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03MCA3MEgxMzBWMTMwSDcwVjcwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K"
                      }}
                    />

                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />

                    {/* Indicador de foto principal */}
                    {foto.principal && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                          Principal
                        </span>
                      </div>
                    )}

                    {/* Indicador de foto local/guardada */}
                    {isFotoLocal(foto) && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                          💾 Guardada
                        </span>
                      </div>
                    )}

                    {/* Indicador de foto temporal */}
                    {isFotoTemporal(foto) && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                          ⏳ Temporal
                        </span>
                      </div>
                    )}

                    {/* Botón eliminar en hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-8 h-8 p-0 bg-white hover:bg-red-100 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEliminarFoto(foto.id)
                        }}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para agregar más fotos (solo si hay menos de 6) */}
              {plazaPhotos.fotos.length < 6 && (
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="add-more-photos"
                  />
                  <label
                    htmlFor="add-more-photos"
                    className="cursor-pointer"
                  >
                    <div className="text-center p-4">
                      <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                      <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors font-medium">
                        Agregar foto
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Mensajes informativos - Solo mostrar en el cliente */}
          {isClient && fotos.some(foto => isFotoTemporal(foto)) && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 text-sm font-medium">
                  ⚠️ Fotos temporales detectadas
                </span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Usa el botón Editar para gestionar y guardar permanentemente
              </p>
            </div>
          )}

          {isClient && fotos.some(foto => isFotoLocal(foto)) && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <span className="text-green-700 text-sm font-medium">
                  ✅ Fotos guardadas localmente
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {fotos.filter(f => isFotoLocal(f)).length} foto(s) se mantienen después de refrescar la página
              </p>
            </div>
          )}

          {/* Modal para ver foto en grande */}
          {fotoSeleccionada && (
            <Dialog
              open={!!fotoSeleccionada}
              onOpenChange={() => setFotoSeleccionada(null)}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <VisuallyHidden>
                  <DialogTitle>Ver foto: {fotoSeleccionada.alt}</DialogTitle>
                </VisuallyHidden>
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={fotoSeleccionada.url}
                    alt={fotoSeleccionada.alt}
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Debug info - Solo mostrar en cliente */}
          {isClient && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
              <strong>Debug:</strong> Plaza ID: {plazaPhotos.id} | 
              Total: {plazaPhotos.fotos.length} | 
              Guardadas: {fotos.filter(f => isFotoLocal(f)).length} | 
              Temporales: {fotos.filter(f => isFotoTemporal(f)).length}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edición de fotos */}
      <EditPhotosModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        photos={plazaPhotos.fotos.map((foto) => foto.url)} // Convertir a array de URLs
        onSave={handleSavePhotos}
      />
    </>
  )
}

export default PlazaPhotos