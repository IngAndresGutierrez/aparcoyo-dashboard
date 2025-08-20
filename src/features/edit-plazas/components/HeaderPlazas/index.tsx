// features/edit-plazas/components/PlazaHeader.tsx
"use client"

import Image from "next/image"
import { Building2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Tipo para los datos de la plaza
interface PlazaData {
  id: string
  nombre: string
  tipo: "privada" | "publica" | "cubierta" | "descubierta" | "techada"
  imagen?: string
}

interface PlazaHeaderProps {
  // Props para cuando se conecte al backend
  plazaId?: string
  plazaData?: PlazaData
  onEliminar?: (id: string) => void
}

function PlazaHeader({ plazaId, plazaData, onEliminar }: PlazaHeaderProps) {
  // Datos hardcodeados por ahora - se reemplazarán con props del backend
  const plaza: PlazaData = plazaData || {
    id: plazaId || "plaza-001",
    nombre: "Q Park Mayfair Car Park",
    tipo: "privada",
    imagen: "/placeholder-parking.jpg", // Imagen placeholder
  }

  // Función para manejar la eliminación
  const handleEliminar = () => {
    if (onEliminar) {
      onEliminar(plaza.id)
    }
    console.log("Eliminar plaza:", plaza.nombre)
  }

  // Función para formatear el tipo para mostrar
  const formatTipo = (tipo: string) => {
    const tipos = {
      privada: "Plaza Privada",
      publica: "Plaza Pública",
      cubierta: "Plaza Cubierta",
      descubierta: "Plaza Descubierta",
      techada: "Plaza Techada",
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  return (
    <div className="bg-white -mt-18 ml-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Lado izquierdo - Imagen y info */}
          <div className="flex items-center gap-4">
            {/* Imagen de la plaza */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {plaza.imagen ? (
                <Image
                  src={plaza.imagen}
                  alt={plaza.nombre}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              ) : (
                // Placeholder cuando no hay imagen
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Información de la plaza */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {plaza.nombre}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{formatTipo(plaza.tipo)}</span>
              </div>
            </div>
          </div>

          {/* Lado derecho - Botón eliminar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEliminar}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PlazaHeader
