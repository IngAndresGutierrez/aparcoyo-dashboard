// features/edit-plazas/components/PlazaPhotos.tsx
"use client"

import { useState } from "react"
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
  const [fotos, setFotos] = useState<Foto[]>(() => {
    // Solo usar datos recibidos, sin fotos hardcodeadas
    return photosData?.fotos || []
  })

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

  // Función para guardar fotos desde el modal
  const handleSavePhotos = (newPhotosUrls: string[]): void => {
    // Convertir URLs de vuelta a objetos Foto
    const newFotos: Foto[] = newPhotosUrls.map((url, index) => ({
      id: `foto-${Date.now()}-${index}`, // Generar ID único
      url: url,
      alt: `Foto ${index + 1} del aparcamiento`,
      principal: index === 0, // Primera foto es principal
    }))

    setFotos(newFotos)
    console.log("Fotos actualizadas:", newFotos)

    // Aquí podrías llamar a una API para guardar en el backend
    // await updatePlazaPhotos(plazaId, newFotos)
  }

  // Función para manejar click en foto
  const handleFotoClick = (foto: Foto): void => {
    setFotoSeleccionada(foto)
  }

  // Función para manejar subida de foto directa (desde el grid)
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0]
    if (file) {
      // Crear URL temporal del archivo
      const url = URL.createObjectURL(file)
      
      // Crear objeto Foto
      const nuevaFoto: Foto = {
        id: `foto-${Date.now()}`,
        url: url,
        alt: `Foto ${fotos.length + 1} del aparcamiento`,
        principal: fotos.length === 0 // Primera foto es principal
      }
      
      setFotos([...fotos, nuevaFoto])
      console.log('Archivo agregado directamente:', file.name)
      
      if (onAgregarFoto) {
        onAgregarFoto(file)
      }
    }
  }

  // Función para eliminar foto individual (desde el grid)
  const handleEliminarFoto = (fotoId: string): void => {
    const fotoAEliminar = fotos.find(foto => foto.id === fotoId)
    
    // Si es una URL temporal, limpiarla
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

  return (
    <>
      <Card className="w-132">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Fotos</h2>
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
                      onError={() => {
                        console.error('Error cargando imagen:', foto.url)
                        // Si es una imagen local que falló, eliminarla
                        if (foto.url.startsWith('blob:') || foto.url.startsWith('/')) {
                          handleEliminarFoto(foto.id)
                        }
                      }}
                    />

                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />

                    {/* Indicador de foto principal */}
                    {foto.principal && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                          Principal
                        </span>
                      </div>
                    )}

                    {/* Indicador de foto temporal */}
                    {foto.url.startsWith('blob:') && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
                          Temporal
                        </span>
                      </div>
                    )}

                    {/* Botón eliminar en hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-8 h-8 p-0 bg-white hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEliminarFoto(foto.id)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Placeholder cuando la imagen no carga */}
                  <div
                    className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${
                      index === 0 ? "min-h-[200px]" : ""
                    }`}
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              ))}

              {/* Botón para agregar más fotos (solo si hay menos de 6) */}
              {plazaPhotos.fotos.length < 6 && (
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
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
                      <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">
                        Agregar foto
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Mensaje informativo para fotos temporales */}
          {fotos.some(foto => foto.url.startsWith('blob:')) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              💡 Las fotos seleccionadas son temporales. Usa  para gestionarlas o guarda los cambios.
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
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setFotoSeleccionada(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Debug info - remover en producción */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
            <strong>Debug:</strong> Plaza ID: {plazaPhotos.id} | Total fotos:{" "}
            {plazaPhotos.fotos.length} | Temporales: {fotos.filter(f => f.url.startsWith('blob:')).length}
          </div>
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