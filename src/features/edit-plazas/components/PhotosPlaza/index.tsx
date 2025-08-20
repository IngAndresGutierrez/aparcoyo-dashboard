// features/edit-plazas/components/PlazaPhotos.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent,  DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// Tipo para las fotos
interface Foto {
  id: string
  url: string
  alt: string
  principal?: boolean
}

interface PlazaPhotosData {
  id: string
  fotos: Foto[]
}

interface PlazaPhotosProps {
  // Props para cuando se conecte al backend
  plazaId?: string
  photosData?: PlazaPhotosData
  onEditar?: () => void
  onAgregarFoto?: (file: File) => void
  onEliminarFoto?: (fotoId: string) => void
}

function PlazaPhotos({ 
  plazaId, 
  photosData, 
  onEditar,
  onAgregarFoto,
  onEliminarFoto
}: PlazaPhotosProps) {
  
  // Estado para la foto seleccionada en el modal
  const [fotoSeleccionada, setFotoSeleccionada] = useState<Foto | null>(null)
  
  // Datos hardcodeados por ahora - se reemplazarán con props del backend
  const plazaPhotos: PlazaPhotosData = photosData || {
    id: plazaId || "plaza-001",
    fotos: [
      {
        id: "foto-1",
        url: "/parking-photos/parking-1.jpg",
        alt: "Vista general del aparcamiento",
        principal: true
      },
      {
        id: "foto-2", 
        url: "/parking-photos/parking-2.jpg",
        alt: "Zona de entrada del parking"
      },
      {
        id: "foto-3",
        url: "/parking-photos/parking-3.jpg", 
        alt: "Plazas de aparcamiento disponibles"
      },
      {
        id: "foto-4",
        url: "/parking-photos/parking-4.jpg",
        alt: "Vista lateral del aparcamiento"
      }
    ]
  }

  // Función para manejar la edición
  const handleEditar = () => {
    if (onEditar) {
      onEditar()
    }
    console.log('Editar fotos de plaza:', plazaPhotos.id)
  }

  // Función para manejar click en foto
  const handleFotoClick = (foto: Foto) => {
    setFotoSeleccionada(foto)
  }

  // Función para manejar subida de foto
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onAgregarFoto) {
      onAgregarFoto(file)
    }
  }

  // Función para eliminar foto
  const handleEliminarFoto = (fotoId: string) => {
    if (onEliminarFoto) {
      onEliminarFoto(fotoId)
    }
    console.log('Eliminar foto:', fotoId)
  }

  return (
    <Card className="w-132">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Fotos
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
            <p className="text-gray-500 text-sm mb-4">No hay fotos disponibles</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="upload-photo"
            />
            <label htmlFor="upload-photo">
              <Button variant="outline" size="sm" asChild>
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
                  index === 0 ? 'col-span-2 row-span-2' : 'aspect-square'
                }`}
                onClick={() => handleFotoClick(foto)}
              >
                <div className={`relative ${index === 0 ? 'h-full min-h-[200px]' : 'aspect-square'}`}>
                  <Image
                    src={foto.url}
                    alt={foto.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
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
                <div className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${index === 0 ? 'min-h-[200px]' : ''}`}>
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
                <label htmlFor="add-more-photos" className="cursor-pointer">
                  <div className="text-center p-4">
                    <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">Agregar foto</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Modal para ver foto en grande */}
        {fotoSeleccionada && (
          <Dialog open={!!fotoSeleccionada} onOpenChange={() => setFotoSeleccionada(null)}>
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
          <strong>Debug:</strong> Plaza ID: {plazaPhotos.id} | Total fotos: {plazaPhotos.fotos.length}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlazaPhotos