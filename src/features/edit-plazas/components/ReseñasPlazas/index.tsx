// features/edit-plazas/components/PlazaReviews.tsx
"use client"

import { useState } from "react"
import { Star, MoreHorizontal, Edit, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

// Tipo para las reseñas
interface Resena {
  id: string
  usuario: {
    nombre: string
    avatar?: string
    iniciales?: string
  }
  calificacion: number
  comentario: string
  fecha: string
  fechaRelativa: string
}

interface PlazaReviewsData {
  id: string
  calificacionPromedio: number
  totalResenas: number
  resenas: Resena[]
}

interface PlazaReviewsProps {
  // Props para cuando se conecte al backend
  plazaId?: string
  reviewsData?: PlazaReviewsData
  onEditarResena?: (resenaId: string) => void
  onEliminarResena?: (resenaId: string) => void
  onCargarMas?: () => void
}

function PlazaReviews({
  plazaId,
  reviewsData,
  onEditarResena,
  onEliminarResena,
  onCargarMas,
}: PlazaReviewsProps) {
  // Estado para controlar cuántas reseñas mostrar
  const [mostrarTodas, setMostrarTodas] = useState(false)

  // Datos hardcodeados por ahora - se reemplazarán con props del backend
  const plazaReviews: PlazaReviewsData = reviewsData || {
    id: plazaId || "plaza-001",
    calificacionPromedio: 4.8,
    totalResenas: 120,
    resenas: [
      {
        id: "resena-1",
        usuario: {
          nombre: "Andrea",
          iniciales: "A",
        },
        calificacion: 5,
        comentario:
          "Muy buena experiencia. El acceso fue fácil y el lugar se sentía seguro. Repetiré sin duda cuando vuelva por la zona.",
        fecha: "2024-01-15",
        fechaRelativa: "hace 1 semana",
      },
      {
        id: "resena-2",
        usuario: {
          nombre: "Candice",
          iniciales: "C",
        },
        calificacion: 5,
        comentario:
          "Muy buena experiencia. El acceso fue fácil y el lugar se sentía seguro. Repetiré sin duda cuando vuelva por la zona.",
        fecha: "2024-01-10",
        fechaRelativa: "hace 1 semana",
      },
      {
        id: "resena-3",
        usuario: {
          nombre: "Andrea",
          iniciales: "A",
        },
        calificacion: 5,
        comentario:
          "Muy buena experiencia. El acceso fue fácil y el lugar se sentía seguro. Repetiré sin duda cuando vuelva por la zona.",
        fecha: "2024-01-08",
        fechaRelativa: "hace 1 semana",
      },
      {
        id: "resena-4",
        usuario: {
          nombre: "Carlos",
          iniciales: "C",
        },
        calificacion: 5,
        comentario:
          "Excelente servicio al cliente. Me ayudaron con todas mis preguntas y el ambiente era muy acogedor.",
        fecha: "2024-01-05",
        fechaRelativa: "hace 3 días",
      },
    ],
  }

  // Función para manejar editar reseña
  const handleEditarResena = (resenaId: string) => {
    if (onEditarResena) {
      onEditarResena(resenaId)
    }
    console.log("Editar reseña:", resenaId)
  }

  // Función para manejar eliminar reseña
  const handleEliminarResena = (resenaId: string) => {
    if (onEliminarResena) {
      onEliminarResena(resenaId)
    }
    console.log("Eliminar reseña:", resenaId)
  }

  // Función para cargar más reseñas
  const handleCargarMas = () => {
    if (onCargarMas) {
      onCargarMas()
    } else {
      setMostrarTodas(true)
    }
    console.log("Cargar más reseñas")
  }

  // Función para renderizar estrellas
  const renderEstrellas = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < calificacion
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))
  }

  // Función para obtener las iniciales del usuario
  const getIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Determinar cuántas reseñas mostrar
  const resenasAMostrar = mostrarTodas
    ? plazaReviews.resenas
    : plazaReviews.resenas.slice(0, 3)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {plazaReviews.calificacionPromedio}
            </span>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <span className="text-gray-600 text-base">
            {plazaReviews.totalResenas} Reseñas
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lista de reseñas */}
        {resenasAMostrar.map((resena) => (
          <div
            key={resena.id}
            className="space-y-3"
          >
            {/* Header de la reseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar del usuario */}
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {resena.usuario.avatar ? (
                    <Image
                      src={resena.usuario.avatar}
                      alt={resena.usuario.nombre}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">
                      {resena.usuario.iniciales ||
                        getIniciales(resena.usuario.nombre)}
                    </span>
                  )}
                </div>

                {/* Nombre y fecha */}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {resena.usuario.nombre}
                  </h4>
                  <p className="text-gray-500 text-xs">
                    {resena.fechaRelativa}
                  </p>
                </div>
              </div>

              {/* Menú de opciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditarResena(resena.id)}
                    className="text-gray-700 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar reseña
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleEliminarResena(resena.id)}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar reseña
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Calificación */}
            <div className="flex items-center gap-1">
              {renderEstrellas(resena.calificacion)}
            </div>

            {/* Comentario */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {resena.comentario}
            </p>
          </div>
        ))}

        {/* Botón cargar más */}
        {!mostrarTodas && plazaReviews.resenas.length > 3 && (
          <div className="pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCargarMas}
              className="text-gray-600 hover:text-gray-800 p-0 h-auto font-medium"
            >
              <span className="mr-2">Cargar más</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Debug info - remover en producción */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <strong>Debug:</strong> Plaza ID: {plazaReviews.id} | Promedio:{" "}
          {plazaReviews.calificacionPromedio} | Total:{" "}
          {plazaReviews.totalResenas} reseñas
        </div>
      </CardContent>
    </Card>
  )
}

export default PlazaReviews
