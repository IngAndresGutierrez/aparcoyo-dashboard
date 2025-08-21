/* eslint-disable @next/next/no-img-element */
// PlazaReviews.tsx - VERSIÓN FINAL CONECTADA AL BACKEND

"use client"

import { useState, useEffect } from "react"
import {
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  Edit3,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plaza, Resena } from "@/features/plazas/types/reseñas"
import { usePlazaReviews } from "@/features/plazas/hooks/useReseña"

// Imports del backend

interface PlazaReviewsProps {
  userId: string
  plazaId?: string
  onPlazaSelect?: (plaza: Plaza) => void
  showDebugInfo?: boolean
}

function PlazaReviews({
  userId,
  plazaId,

  showDebugInfo = false,
}: PlazaReviewsProps) {
  console.log("🎯 PlazaReviews renderizado con userId:", userId)

  // Hook para manejar datos del backend
  const {
    data,
    loading,
    error,
    fetchPlazasByUser,
    updateReview,
    deleteReview,
    clearError,
  } = usePlazaReviews()

  // Estados locales para UI
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [resenaAEditar, setResenaAEditar] = useState<Resena | null>(null)
  const [textoResena, setTextoResena] = useState("")
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null)
  const [plazaSeleccionada, setPlazaSeleccionada] = useState<Plaza | null>(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log("🔄 useEffect - userId:", userId)
    if (userId) {
      fetchPlazasByUser(userId)
    }
  }, [userId, fetchPlazasByUser])

  // Seleccionar plaza específica o la primera disponible
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      console.log("📊 Plazas disponibles:", data.data.length)

      if (plazaId) {
        const plaza = data.data.find((p: Plaza) => p.id === plazaId)
        setPlazaSeleccionada(plaza || data.data[0])
        console.log("🎯 Plaza seleccionada por ID:", plaza?.id)
      } else {
        setPlazaSeleccionada(data.data[0])
        console.log("🎯 Primera plaza seleccionada:", data.data[0]?.id)
      }
    } else {
      console.log("📭 No hay plazas disponibles")
      setPlazaSeleccionada(null)
    }
  }, [data, plazaId])

  // Función para manejar editar reseña
  const handleEditarResena = (resenaId: string) => {
    console.log("🖊️ Editando reseña:", resenaId)
    const resena = plazaSeleccionada?.resenas?.find((r) => r.id === resenaId)
    if (resena) {
      setResenaAEditar(resena)
      setTextoResena(resena.comentario || "") // ← Solución: || ""
      setModalEditarAbierto(true)
      setDropdownAbierto(null)
    }
  }

  // Función para guardar la reseña editada
  const handleGuardarResena = async () => {
    if (resenaAEditar && textoResena.trim() && plazaSeleccionada) {
      try {
        console.log("💾 Guardando reseña editada...")
        await updateReview(plazaSeleccionada.id, resenaAEditar.id, {
          comentario: textoResena,
        })
        setModalEditarAbierto(false)
        setResenaAEditar(null)
        console.log("✅ Reseña actualizada correctamente")
      } catch (error) {
        console.error("❌ Error actualizando reseña:", error)
      }
    }
  }

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setTextoResena(resenaAEditar?.comentario || "") // ← Solución: || ""
    setModalEditarAbierto(false)
    setResenaAEditar(null)
  }

  // Función para manejar eliminar reseña
  const handleEliminarResena = async (resenaId: string) => {
    if (plazaSeleccionada) {
      try {
        console.log("🗑️ Eliminando reseña:", resenaId)
        await deleteReview(plazaSeleccionada.id, resenaId)
        setDropdownAbierto(null)
        console.log("✅ Reseña eliminada correctamente")
      } catch (error) {
        console.error("❌ Error eliminando reseña:", error)
      }
    }
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

  // Estados de carga
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Cargando plazas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estados de error
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-red-600 font-medium">
              Error al cargar las plazas
            </div>
            <div className="text-gray-600 text-sm">{error}</div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
              >
                Limpiar error
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPlazasByUser(userId)}
              >
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Sin plazas
  if (!data?.data || data.data.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Este usuario no tiene plazas
              </h3>
              <p className="text-gray-600 text-sm">
                Este usuario aún no ha registrado ninguna plaza en el sistema
              </p>
            </div>

            {showDebugInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                <div>
                  <strong>Debug Info (Admin Dashboard):</strong>
                </div>
                <div>Usuario ID: {userId}</div>
                <div>Respuesta: {data?.msg}</div>
                <div>Total plazas: {data?.data?.length || 0}</div>
                <div>Estado: {data?.ok ? "OK" : "Error"}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Sin reseñas en la plaza seleccionada
  if (!plazaSeleccionada?.resenas || plazaSeleccionada.resenas.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">0.0</span>
              <Star className="w-6 h-6 text-gray-300" />
            </div>
            <span className="text-gray-600 text-base">0 Reseñas</span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900">
              {plazaSeleccionada?.nombre}
            </h3>
            <p className="text-gray-600 text-sm">
              {plazaSeleccionada?.direccion}
            </p>
          </div>
        </CardHeader>

        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Sin reseñas aún
              </h3>
              <p className="text-gray-600 text-sm">
                Esta plaza aún no tiene reseñas de usuarios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determinar cuántas reseñas mostrar
  const resenasAMostrar = mostrarTodas
    ? plazaSeleccionada.resenas
    : plazaSeleccionada.resenas.slice(0, 3)

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {plazaSeleccionada.calificacionPromedio?.toFixed(1) || "0.0"}
              </span>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-gray-600 text-base">
              {plazaSeleccionada.totalResenas ||
                plazaSeleccionada.resenas.length}{" "}
              Reseñas
            </span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900">
              {plazaSeleccionada.nombre}
            </h3>
            <p className="text-gray-600 text-sm">
              {plazaSeleccionada.direccion}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lista de reseñas */}
          {resenasAMostrar.map((resena: Resena) => (
            <div
              key={resena.id}
              className="space-y-3"
            >
              {/* Header de la reseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar del usuario */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {resena.usuario?.avatar ? (
                      <img
                        src={resena.usuario.avatar}
                        alt={resena.usuario.nombre || "Usuario"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm font-medium">
                        {getIniciales(resena.usuario?.nombre || "Usuario")}
                      </span>
                    )}
                  </div>

                  {/* Nombre y fecha */}
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {resena.usuario?.nombre || "Usuario anónimo"}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      {resena.fechaCreacion
                        ? new Date(resena.fechaCreacion).toLocaleDateString()
                        : "Fecha no disponible"}
                    </p>
                  </div>
                </div>

                {/* Menú de opciones */}
                <DropdownMenu
                  open={dropdownAbierto === resena.id}
                  onOpenChange={(open) =>
                    setDropdownAbierto(open ? resena.id : null)
                  }
                >
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
                {renderEstrellas(resena.calificacion || 0)}
              </div>

              {/* Comentario */}
              <p className="text-gray-700 text-sm leading-relaxed">
                {resena.comentario || "Sin comentario"}
              </p>
            </div>
          ))}

          {/* Botón cargar más */}
          {!mostrarTodas && plazaSeleccionada.resenas.length > 3 && (
            <div className="pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarTodas(true)}
                className="text-gray-600 hover:text-gray-800 p-0 h-auto font-medium"
              >
                <span className="mr-2">Cargar más</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Debug info */}
          {showDebugInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600 space-y-1">
              <div>
                <strong>Debug Info:</strong>
              </div>
              <div>Plaza ID: {plazaSeleccionada.id}</div>
              <div>Usuario ID: {userId}</div>
              <div>Total plazas: {data.data.length}</div>
              <div>
                Reseñas de esta plaza: {plazaSeleccionada.resenas.length}
              </div>
              <div>Backend mensaje: {data.msg}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para editar reseña */}
      <Dialog
        open={modalEditarAbierto}
        onOpenChange={setModalEditarAbierto}
      >
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white rounded-xl shadow-xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Editar reseña
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="review"
                  className="text-sm font-medium text-gray-700"
                >
                  Reseña
                </Label>
                <textarea
                  id="review"
                  value={textoResena}
                  onChange={(e) => setTextoResena(e.target.value)}
                  placeholder="Escribe tu reseña aquí..."
                  className="w-full min-h-[120px] resize-none border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelarEdicion}
              className="px-4 py-2 text-sm"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarResena}
              className="px-4 py-2 text-sm"
              disabled={loading || !textoResena.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PlazaReviews
