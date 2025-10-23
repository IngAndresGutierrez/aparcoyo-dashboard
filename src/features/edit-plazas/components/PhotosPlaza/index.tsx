/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// features/edit-plazas/components/PlazaPhotos.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { toast } from "sonner"
import { PlazaPhotosService } from "../../services/service-photo-edit"

// Tipo para las fotos que vienen del backend
interface FotoBackend {
  id: string
  url: string
  tipo: string
  nombre: string
  tamaño: number
  createdAt: string
  plazaId?: string
}

interface PlazaPhotosProps {
  plazaId: string
}

// 🔧 Función helper para asegurar HTTPS en las URLs
function normalizeImageUrl(url: string): string {
  if (!url) return url

  // Opción 1: Intentar cambiar a HTTPS
  if (url.startsWith("http://kns.aparcoyo.com")) {
    const httpsUrl = url.replace(
      "http://kns.aparcoyo.com",
      "https://kns.aparcoyo.com"
    )
    console.log("🔄 URL normalizada a HTTPS:", {
      original: url,
      normalizada: httpsUrl,
    })
    return httpsUrl
  }

  // Opción 2: Si HTTPS no funciona, usar proxy de Next.js
  // Descomenta esto si HTTPS falla:
  // if (url.startsWith('http://')) {
  //   const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
  //   console.log('🔄 URL con proxy:', { original: url, proxy: proxyUrl })
  //   return proxyUrl
  // }

  return url
}

function PlazaPhotos({ plazaId }: PlazaPhotosProps) {
  // Estados
  const [fotos, setFotos] = useState<FotoBackend[]>([])
  const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoBackend | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ✅ Cargar fotos desde el backend al montar
  useEffect(() => {
    if (plazaId) {
      loadPhotosFromBackend()
    }
  }, [plazaId])

  // ✅ Función para cargar fotos desde el backend
  const loadPhotosFromBackend = async () => {
    try {
      setIsLoading(true)
      console.log("📥 Cargando fotos de la plaza:", plazaId)

      const result = await PlazaPhotosService.getPlazaWithPhotos(plazaId)

      if (result.success && result.data) {
        const fotosBackend = result.data.img || []

        console.log("🔍 DIAGNÓSTICO COMPLETO:", {
          plazaIdSolicitada: plazaId,
          cantidadFotosRecibidas: fotosBackend.length,
          fotosDetalladas: fotosBackend.map((foto: any) => ({
            id: foto.id,
            nombre: foto.nombre,
            plazaId: foto.plazaId,
            url: foto.url,
            perteneceAEstaPlaza: foto.plazaId === plazaId,
          })),
        })

        // Si no hay fotos, no hacer nada más
        if (fotosBackend.length === 0) {
          console.log("✅ No hay fotos para esta plaza")
          setFotos([])
          return
        }

        // ✅ Normalizar URLs (sin filtrar todavía)
        const fotosNormalizadas = fotosBackend.map((foto: any) => {
          const urlNormalizada = normalizeImageUrl(foto.url)
          return {
            ...foto,
            url: urlNormalizada,
          }
        })

        // ✅ SIEMPRE filtrar por plazaId si existe
        // ✅ Filtrar fotos de esta plaza
        const fotosFiltradas = fotosNormalizadas.filter((foto: any) => {
          // Si la foto tiene plazaId, debe coincidir con la plaza actual
          if (foto.plazaId) {
            const coincide = foto.plazaId === plazaId
            console.log(
              `📋 Foto ${foto.id}: plazaId=${foto.plazaId}, coincide=${coincide}`
            )
            return coincide
          }

          // ✅ Si NO tiene plazaId, asumimos que viene del endpoint correcto
          // (el backend debería devolver solo fotos de esta plaza)
          console.log(
            `📋 Foto ${foto.id} sin plazaId, se incluye (confiamos en el backend)`
          )
          return true
        })

        console.log("📊 Resultado del filtrado:", {
          fotosRecibidas: fotosNormalizadas.length,
          fotosMostradas: fotosFiltradas.length,
          fotosOmitidas: fotosNormalizadas.length - fotosFiltradas.length,
        })

        setFotos(fotosFiltradas)
      } else {
        console.error("❌ Error al cargar fotos:", result.error)
        toast.error("Error al cargar fotos", {
          description: result.error || "No se pudieron cargar las fotos",
        })
      }
    } catch (error) {
      console.error("❌ Error inesperado al cargar fotos:", error)
      toast.error("Error inesperado", {
        description: "Ocurrió un error al cargar las fotos",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Función para subir fotos al backend
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validar cantidad de fotos
    if (fotos.length + files.length > 6) {
      toast.error("Límite de fotos alcanzado", {
        description: `Solo puedes tener máximo 6 fotos. Actualmente tienes ${fotos.length}.`,
      })
      event.target.value = ""
      return
    }

    try {
      setIsUploading(true)
      const archivosArray = Array.from(files)

      const loadingToast = toast.loading("Subiendo fotos...", {
        description: `Subiendo ${archivosArray.length} foto(s)`,
      })

      console.log("📤 Subiendo fotos al backend:", archivosArray.length)

      const result = await PlazaPhotosService.agregarFotos(
        plazaId,
        archivosArray
      )

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success("Fotos agregadas", {
          description: `Se agregaron ${archivosArray.length} foto(s) exitosamente`,
        })

        // Recargar fotos desde el backend
        await loadPhotosFromBackend()
      } else {
        // Manejo de errores específicos
        if (result.error === "UNAUTHORIZED") {
          toast.error("Sesión expirada", {
            description: "Tu sesión ha expirado. Redirigiendo al login...",
          })
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else if (result.error === "FILE_TOO_LARGE") {
          toast.error("Archivos muy grandes", {
            description:
              "Reduce el tamaño de las imágenes e intenta nuevamente.",
          })
        } else if (result.error === "FORBIDDEN") {
          toast.error("Sin permisos", {
            description: "No tienes permisos para agregar fotos a esta plaza.",
          })
        } else {
          toast.error("Error al subir fotos", {
            description: result.message || "No se pudieron subir las fotos",
          })
        }
      }
    } catch (error) {
      console.error("❌ Error inesperado al subir fotos:", error)
      toast.error("Error inesperado", {
        description: "Ocurrió un error al subir las fotos",
      })
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  // ✅ Función para eliminar foto del backend
  const handleEliminarFoto = async (fotoId: string): Promise<void> => {
    const foto = fotos.find((f) => f.id === fotoId)
    if (!foto) return

    // Toast de confirmación
    toast(`¿Eliminar foto?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          await executeDeleteFoto(fotoId, foto.nombre)
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      duration: 10000,
    })
  }

  // ✅ Ejecutar eliminación de foto
  const executeDeleteFoto = async (fotoId: string, nombreFoto: string) => {
    try {
      setDeletingId(fotoId)

      const loadingToast = toast.loading("Eliminando foto...", {
        description: `Eliminando "${nombreFoto}"`,
      })

      console.log(`🗑️ Eliminando foto ${fotoId} de plaza ${plazaId}`)

      const result = await PlazaPhotosService.eliminarFoto(plazaId, fotoId)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success("Foto eliminada", {
          description: "La foto ha sido eliminada exitosamente",
        })

        // Actualizar estado local (optimista)
        setFotos(fotos.filter((f) => f.id !== fotoId))

        // Recargar desde backend para asegurar sincronización
        await loadPhotosFromBackend()
      } else {
        // Manejo de errores específicos
        if (result.error === "UNAUTHORIZED") {
          toast.error("Sesión expirada", {
            description: "Tu sesión ha expirado. Redirigiendo al login...",
          })
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else if (result.error === "FORBIDDEN") {
          toast.error("Sin permisos", {
            description: "No tienes permisos para eliminar esta foto.",
          })
        } else if (result.error === "NOT_FOUND") {
          toast.error("Foto no encontrada", {
            description: "La foto no existe o ya fue eliminada.",
          })
          await loadPhotosFromBackend()
        } else {
          toast.error("Error al eliminar", {
            description: result.message || "No se pudo eliminar la foto",
          })
        }
      }
    } catch (error) {
      console.error("❌ Error inesperado al eliminar foto:", error)
      toast.error("Error inesperado", {
        description: "Ocurrió un error al eliminar la foto",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Función para manejar click en foto
  const handleFotoClick = (foto: FotoBackend): void => {
    setFotoSeleccionada(foto)
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="lg:w-157">
        <CardHeader className="pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fotos</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Cargando fotos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="lg:w-157">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Fotos ({fotos.length}/6)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPhotosFromBackend}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {fotos.length === 0 ? (
            // Estado vacío
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">
                No hay fotos disponibles
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="upload-photo"
                disabled={isUploading}
              />
              <label htmlFor="upload-photo">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isUploading}
                >
                  <span className="cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Agregar primera foto
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            // Grid de fotos
            <div className="grid grid-cols-3 gap-3">
              {fotos.map((foto, index) => {
                const isDeleting = deletingId === foto.id

                return (
                  <div
                    key={foto.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 ${
                      index === 0 ? "col-span-2 row-span-2" : "aspect-square"
                    } ${isDeleting ? "opacity-50" : ""}`}
                    onClick={() => !isDeleting && handleFotoClick(foto)}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        index === 0 ? "h-full min-h-[200px]" : "aspect-square"
                      }`}
                      style={{ backgroundColor: "#f3f4f6" }}
                    >
                      {/* ✅ Imagen con estilos corregidos */}
                      <img
                        src={foto.url}
                        alt={foto.nombre}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          height: "100%",
                        }}
                        onLoad={(e) => {
                          console.log(
                            "✅ Imagen cargada exitosamente:",
                            foto.url
                          )
                          const img = e.target as HTMLImageElement
                          console.log("📐 Dimensiones:", {
                            natural: `${img.naturalWidth}x${img.naturalHeight}`,
                            rendered: `${img.width}x${img.height}`,
                          })
                        }}
                        onError={(e) => {
                          console.error("❌ Error cargando imagen:", {
                            url: foto.url,
                            error: e,
                          })
                          const target = e.target as HTMLImageElement
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUYzNDRCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4="
                        }}
                      />

                      {/* Overlay en hover - SOLO aparece en hover */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-200 pointer-events-none" />

                      {/* Indicador de foto principal */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                            Principal
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
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Botón para agregar más fotos (solo si hay menos de 6) */}
              {fotos.length < 6 && (
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="add-more-photos"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="add-more-photos"
                    className={`cursor-pointer ${
                      isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="text-center p-4">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
                          <span className="text-xs text-blue-600 font-medium">
                            Subiendo...
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                          <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors font-medium">
                            Agregar foto
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}
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
                  <DialogTitle>Ver foto: {fotoSeleccionada.nombre}</DialogTitle>
                </VisuallyHidden>
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={fotoSeleccionada.url}
                    alt={fotoSeleccionada.nombre}
                    fill
                    unoptimized // 🔧 CRÍTICO: También en el modal
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default PlazaPhotos
