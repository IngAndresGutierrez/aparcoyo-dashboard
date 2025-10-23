// features/edit-plazas/components/PlazaHeader.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Building2, Loader2, Trash2 } from "lucide-react"
import { usePlazaById } from "../../hooks/useHeader"
import { deletePlazaService } from "../../services/header-service"
import { toast } from "sonner"
import { useState } from "react"

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
  img?: Array<{
    id: string
    url: string
    tipo: string
    nombre: string
    tamaño: number
    createdAt: string
  }>
  precio?: number
  ciudad?: string
  ubicacion?: string
  disponible?: boolean
  descripcion?: string
  reservas?: number
}

interface PlazaHeaderProps {
  plazaId: string
  plazaData?: PlazaData
  onEliminar?: (id: string) => void
  showEliminar?: boolean
}

// Componente para manejar la imagen con fallback
const PlazaImageWithFallback = ({
  imageUrl,
  nombre,
}: {
  imageUrl?: string
  nombre: string
}) => {
  const [imageError, setImageError] = useState(false)

  console.log("🖼️ PlazaHeader - Imagen:", {
    url: imageUrl,
    hasError: imageError,
    nombre,
  })

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Building2 className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={nombre}
      className="w-full h-full object-cover"
      onError={() => {
        console.log("❌ Error al cargar imagen en PlazaHeader:", imageUrl)
        setImageError(true)
      }}
      onLoad={() => {
        console.log("✅ Imagen cargada en PlazaHeader:", imageUrl)
      }}
    />
  )
}

function PlazaHeader({
  plazaId,
  plazaData,
  onEliminar,
  showEliminar = true,
}: PlazaHeaderProps) {
  const {
    data: plazaFromBackend,
    loading,
    error,
    getPlazaForHeader,
  } = usePlazaById({
    plazaId,
    autoFetch: true,
  })

  const plazaForHeader = getPlazaForHeader()

  // ✅ Obtener la primera imagen desde el campo 'img' del backend
  const primeraImagen =
    plazaForHeader?.imagen || plazaData?.imagen || plazaFromBackend?.imagen

  console.log("🏠 PlazaHeader - Datos:", {
    plazaId,
    backendImg: plazaFromBackend?.img,
    primeraImagen,
    plazaData: plazaData?.img,
  })

  const plaza: PlazaData =
    plazaData ||
    (plazaForHeader
      ? {
          id: plazaForHeader.id,
          nombre: plazaForHeader.nombre,
          tipo: plazaForHeader.tipo,
          imagen: primeraImagen, // ✅ Usar la imagen obtenida
          img: plazaFromBackend?.img, // ✅ Mantener el array completo
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

  const handleEliminar = () => {
    toast(`¿Eliminar "${plaza.nombre}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const loadingToastId = toast.loading("Eliminando plaza...")

          try {
            const result = await deletePlazaService(plaza.id)
            toast.dismiss(loadingToastId)

            if (result.success) {
              toast.success(`Plaza "${plaza.nombre}" eliminada exitosamente`, {
                description: "La plaza ha sido eliminada correctamente",
              })

              if (onEliminar) {
                onEliminar(plaza.id)
              } else {
                setTimeout(() => window.history.back(), 1000)
              }
            } else {
              let errorDescription = ""

              if (result.error === "HAS_ACTIVE_RESERVATIONS") {
                errorDescription =
                  "Cancela las reservas activas primero o contacta soporte para más ayuda."
                toast.warning("Plaza con reservas activas", {
                  description: errorDescription,
                })
              } else if (result.error === "UNAUTHORIZED") {
                toast.error("Sesión expirada", {
                  description:
                    "Tu sesión ha expirado. Redirigiendo al login...",
                })
                setTimeout(() => {
                  window.location.href = "/login"
                }, 2000)
              } else if (result.error === "FORBIDDEN") {
                toast.error("Sin permisos", {
                  description:
                    "No tienes permisos suficientes para eliminar esta plaza.",
                })
              } else if (result.error === "NOT_FOUND") {
                toast.error("Plaza no encontrada", {
                  description: "La plaza que intentas eliminar no existe.",
                })
              } else if (result.error === "CONNECTION_ERROR") {
                toast.error("Error de conexión", {
                  description:
                    "Verifica tu conexión a internet e intenta nuevamente.",
                })
              } else {
                toast.error("Error al eliminar", {
                  description:
                    result.message || "Error inesperado al eliminar la plaza.",
                })
              }
            }
          } catch (unexpectedError) {
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
              ) : (
                <PlazaImageWithFallback
                  imageUrl={primeraImagen}
                  nombre={plaza.nombre}
                />
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
