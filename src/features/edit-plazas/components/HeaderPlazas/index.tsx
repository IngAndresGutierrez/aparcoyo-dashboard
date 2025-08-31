// features/edit-plazas/components/PlazaHeader.tsx
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

import { Building2, Loader2, Trash2 } from "lucide-react"
import { usePlazaById } from "../../hooks/useHeader"
import { deletePlazaService } from "../../services/header-service"
import { toast } from "sonner" // Importar toast de Sonner

// Tipo para los datos de la plaza (manteniendo compatibilidad)
interface PlazaData {
  id: string
  nombre: string
  tipo:
    | "privada"
    | "publica"
    | "inmediata"
    | "cubierta"
    | "descubierta"
    | "techada"
  imagen?: string
  precio?: number
  ciudad?: string
  ubicacion?: string
  disponible?: boolean
  descripcion?: string
  reservas?: number
}

interface PlazaHeaderProps {
  plazaId: string
  // Props opcionales para override
  plazaData?: PlazaData
  onEliminar?: (id: string) => void
  showEliminar?: boolean
}

function PlazaHeader({
  plazaId,
  plazaData,
  onEliminar,
  showEliminar = true,
}: PlazaHeaderProps) {
  // Hook para obtener la plaza específica por ID
  const {
    data: plazaFromBackend,
    loading,
    error,
    getPlazaForHeader,
  } = usePlazaById({
    plazaId,
    autoFetch: true,
  })

  // Obtener la plaza adaptada para el header
  const plazaForHeader = getPlazaForHeader()

  // Determinar qué datos usar
  const plaza: PlazaData =
    plazaData ||
    (plazaForHeader
      ? {
          id: plazaForHeader.id,
          nombre: plazaForHeader.nombre,
          tipo: plazaForHeader.tipo,
          imagen: plazaForHeader.imagen,
          precio: plazaForHeader.precio,
          ciudad: plazaForHeader.ciudad,
          ubicacion: plazaForHeader.ubicacion,
          disponible: plazaForHeader.disponible,
          descripcion: plazaFromBackend?.descripcion,
          reservas: plazaFromBackend?.reservas?.length || 0,
        }
      : {
          id: plazaId,
          nombre: loading
            ? "Cargando plaza..."
            : error
            ? "Error al cargar plaza"
            : "Plaza no encontrada",
          tipo: "privada",
          imagen: undefined,
        })

  // Función para manejar la eliminación
  const handleEliminar = () => {
    // Toast de confirmación con Sonner
    toast(`¿Eliminar "${plaza.nombre}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          // Mostrar toast de loading inmediatamente
          const loadingToastId = toast.loading("Eliminando plaza...")

          try {
            // Llamar al servicio mejorado
            const result = await deletePlazaService(plaza.id)

            // Dismiss el toast de loading
            toast.dismiss(loadingToastId)

            if (result.success) {
              // Éxito
              toast.success(`Plaza "${plaza.nombre}" eliminada exitosamente`, {
                description: "La plaza ha sido eliminada correctamente",
              })

              // Ejecutar callback si existe
              if (onEliminar) {
                onEliminar(plaza.id)
              } else {
                // Comportamiento por defecto: regresar a la página anterior
                setTimeout(() => window.history.back(), 1000)
              }
            } else {
              // Manejar diferentes tipos de errores SIN LANZAR EXCEPCIONES
              let errorDescription = ""

              if (result.error === "HAS_ACTIVE_RESERVATIONS") {
                // Error específico: plaza con reservas activas
                errorDescription =
                  "Cancela las reservas activas primero o contacta soporte para más ayuda."
                toast.warning("Plaza con reservas activas", {
                  description: errorDescription,
                })
              } else if (result.error === "UNAUTHORIZED") {
                // Token expirado
                toast.error("Sesión expirada", {
                  description:
                    "Tu sesión ha expirado. Redirigiendo al login...",
                })
                // Redirigir al login después del toast
                setTimeout(() => {
                  window.location.href = "/login"
                }, 2000)
              } else if (result.error === "FORBIDDEN") {
                // Sin permisos
                toast.error("Sin permisos", {
                  description:
                    "No tienes permisos suficientes para eliminar esta plaza.",
                })
              } else if (result.error === "NOT_FOUND") {
                // Plaza no existe
                toast.error("Plaza no encontrada", {
                  description: "La plaza que intentas eliminar no existe.",
                })
              } else if (result.error === "CONNECTION_ERROR") {
                // Error de conexión
                toast.error("Error de conexión", {
                  description:
                    "Verifica tu conexión a internet e intenta nuevamente.",
                })
              } else {
                // Error genérico
                toast.error("Error al eliminar", {
                  description:
                    result.message || "Error inesperado al eliminar la plaza.",
                })
              }
            }
          } catch (unexpectedError) {
            // Este catch solo se ejecutará en casos muy excepcionales
            // porque nuestro servicio nunca lanza errores
            console.error(
              "Error inesperado en handleEliminar:",
              unexpectedError
            )
            toast.dismiss(loadingToastId)
            toast.error("Error inesperado", {
              description: "Ocurrió un error inesperado. Intenta nuevamente.",
            })
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    })
  }

  // Función para formatear el tipo
  const formatTipo = (tipo: string) => {
    const tipos = {
      privada: "Plaza Privada",
      publica: "Plaza Pública",
      inmediata: "Plaza Inmediata",
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
              {loading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : plaza.imagen ? (
                <Image
                  src={plaza.imagen}
                  alt={plaza.nombre}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Información de la plaza */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando...
                  </div>
                ) : (
                  plaza.nombre
                )}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{formatTipo(plaza.tipo)}</span>
                {(plaza.ciudad || plaza.ubicacion) && (
                  <>
                    <span>•</span>
                    <span>{plaza.ciudad || plaza.ubicacion}</span>
                  </>
                )}
                {plaza.disponible !== undefined && (
                  <>
                    <span>•</span>
                    <span
                      className={
                        plaza.disponible ? "text-green-600" : "text-red-600"
                      }
                    >
                      {plaza.disponible ? "Disponible" : "No disponible"}
                    </span>
                  </>
                )}
              </div>

              {/* Info adicional del backend */}
              {(plazaFromBackend || plaza.reservas !== undefined) && (
                <div className="text-xs text-gray-500 mt-1">
                  {plaza.reservas !== undefined && plaza.reservas > 0 && (
                    <span>{plaza.reservas} reserva(s) • </span>
                  )}
                  {plazaFromBackend?.createdAt && (
                    <span>
                      Creada:{" "}
                      {new Date(
                        plazaFromBackend.createdAt
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lado derecho - Botón eliminar */}
          {showEliminar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEliminar}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlazaHeader
