import React, { useState, useEffect } from "react"
import {
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react"
import EditReviewModal from "../ModalPLazasReseñas"
import { Review } from "@/features/edit-plazas/types/reviews"

import { toast } from "sonner"
import { useReviews } from "@/features/edit-plazas/hooks/useReviews"

interface PlazaReviewsProps {
  userId?: string
  plazaId?: string | null
  showDebugInfo?: boolean
}

function PlazaReviews({
  userId = "user-1",
  plazaId = null,
}: PlazaReviewsProps) {
  console.log(
    "🎯 PlazaReviews renderizado con userId:",
    userId,
    "plazaId:",
    plazaId
  )

  const { reviews, loading, error, fetchReviews, deleteReview } = useReviews()

  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [resenaAEditar, setResenaAEditar] = useState<Review | null>(null)
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null)
  const toggleDropdown = (resenaId: string) => {
    setDropdownAbierto(dropdownAbierto === resenaId ? null : resenaId)
  }

  // Cargar reseñas al montar
  useEffect(() => {
    console.log("🔄 useEffect - Cargando reseñas")
    fetchReviews()
  }, [])

  // Filtrar reseñas por plaza si se especifica - con validación
  const resenasPlaza = Array.isArray(reviews) ? reviews : []
  console.log("🔍 Debug - reviews:", reviews)
  console.log("🔍 Debug - Array.isArray(reviews):", Array.isArray(reviews))
  console.log("🔍 Debug - plazaId:", plazaId)
  console.log("🔍 Debug - resenasPlaza:", resenasPlaza)

  // Calcular estadísticas
  const totalResenas = resenasPlaza.length
  const calificacionPromedio =
    totalResenas > 0
      ? resenasPlaza.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas
      : 0

  const handleEditarResena = (resenaId: string) => {
    console.log("🖊️ Editando reseña:", resenaId)
    const resena = resenasPlaza.find((r) => r.id === resenaId)
    if (resena) {
      setResenaAEditar(resena)
      setModalEditarAbierto(true)
      setDropdownAbierto(null)
    }
  }

  const handleEliminarResena = async (resenaId: string) => {
    console.log("🗑️ Eliminando reseña:", resenaId)

    // Mostrar confirmación
    toast("¿Estás seguro de eliminar esta reseña?", {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteReview(resenaId)
            setDropdownAbierto(null)
            console.log("✅ Reseña eliminada")

            // Toast de confirmación
            toast.success("Reseña eliminada correctamente")
          } catch (error) {
            console.error("❌ Error eliminando reseña:", error)
            toast.error("Error al eliminar la reseña")
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
          setDropdownAbierto(null)
        },
      },
    })
  }

  const renderEstrellas = (calificacion: number, baseKey: string) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`${baseKey}-star-${index}`}
        className={`w-4 h-4 ${
          index < calificacion
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const getIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600 font-medium">
                Cargando reseñas...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  if (totalResenas === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  No hay reseñas disponibles
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {plazaId
                    ? "Esta plaza aún no tiene reseñas"
                    : "No hay reseñas para mostrar"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const resenasAMostrar = mostrarTodas ? resenasPlaza : resenasPlaza.slice(0, 3)

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {calificacionPromedio.toFixed(1)}
                </span>
                <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-gray-600 text-lg">
                {totalResenas} Reseñas
              </span>
            </div>

            {plazaId && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">
                  Plaza {plazaId}
                </h3>
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {resenasAMostrar.map((resena, index) => {
              const isDropdownOpen = dropdownAbierto === resena.id

              return (
                <div
                  key={`resena-${resena.id}`}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-gray-600 text-sm font-semibold">
                          {getIniciales(resena.usuario?.nombre || "Usuario")}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {resena.usuario?.nombre || "Usuario anónimo"}
                        </h4>
                        <p className="text-gray-500 text-sm">Hace poco</p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => resena.id && toggleDropdown(resena.id)}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {isDropdownOpen && resena.id && (
                        <div className="absolute right-0 top-12 z-50 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                          <button
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              resena.id && handleEditarResena(resena.id)
                            }
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Editar reseña
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() =>
                              resena.id && handleEliminarResena(resena.id)
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Eliminar reseña
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {renderEstrellas(
                      resena.estrellas,
                      resena.id || `temp-${index}`
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm">
                    {resena.comentario}
                  </p>
                </div>
              )
            })}

            {!mostrarTodas && resenasPlaza.length > 3 && (
              <div className="pt-6">
                <button
                  onClick={() => setMostrarTodas(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <span>Cargar más reseñas</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditReviewModal
        reviewId={resenaAEditar?.id}
        initialData={
          resenaAEditar
            ? {
                comentario: resenaAEditar.comentario,
                estrellas: resenaAEditar.estrellas,
                usuario: resenaAEditar.usuario,
                plaza: resenaAEditar.plaza,
              }
            : undefined
        }
        isOpen={modalEditarAbierto}
        onClose={() => {
          setModalEditarAbierto(false)
          setResenaAEditar(null)
          fetchReviews() // Recargar tras editar
        }}
      />
    </>
  )
}

export default PlazaReviews
