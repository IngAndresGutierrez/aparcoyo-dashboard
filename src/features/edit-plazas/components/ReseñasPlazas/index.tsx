import React, { useState, useEffect } from "react"
import {
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  Edit3,
  Loader2,
} from "lucide-react"

// Mock data types
interface Usuario {
  id: string
  nombre: string
  avatar?: string
}

interface Resena {
  id: string
  comentario: string
  calificacion: number
  fechaCreacion: string
  usuario: Usuario
}

interface Plaza {
  id: string
  nombre: string
  direccion: string
  calificacionPromedio: number
  totalResenas: number
  resenas: Resena[]
}

interface PlazaReviewsProps {
  userId?: string
  plazaId?: string | null
  onPlazaSelect?: (plaza: Plaza) => void
  showDebugInfo?: boolean
}

// Mock data - Simulando datos del backend
const mockPlazas: Plaza[] = [
  {
    id: "plaza-1",
    nombre: "Plaza Central",
    direccion: "Calle Principal #123, Centro",
    calificacionPromedio: 4.2,
    totalResenas: 15,
    resenas: [
      {
        id: "resena-1",
        comentario:
          "Excelente lugar, muy limpio y seguro. Perfecto para pasar tiempo en familia.",
        calificacion: 5,
        fechaCreacion: "2024-08-30T10:30:00Z",
        usuario: {
          id: "user-1",
          nombre: "María González",
          avatar: "",
        },
      },
      {
        id: "resena-2",
        comentario:
          "Buen lugar, aunque podría tener más sombra en las áreas de descanso.",
        calificacion: 4,
        fechaCreacion: "2024-08-29T15:45:00Z",
        usuario: {
          id: "user-2",
          nombre: "Carlos Rodríguez",
        },
      },
      {
        id: "resena-3",
        comentario:
          "Me encanta venir aquí los fines de semana. Siempre está bien cuidada.",
        calificacion: 5,
        fechaCreacion: "2024-08-28T09:15:00Z",
        usuario: {
          id: "user-3",
          nombre: "Ana López",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
      },
      {
        id: "resena-4",
        comentario: "Regular, necesita más mantenimiento en las bancas.",
        calificacion: 3,
        fechaCreacion: "2024-08-27T18:20:00Z",
        usuario: {
          id: "user-4",
          nombre: "Pedro Martínez",
        },
      },
    ],
  },
  {
    id: "plaza-2",
    nombre: "Parque de los Niños",
    direccion: "Avenida Los Cerezos #456, Norte",
    calificacionPromedio: 3.8,
    totalResenas: 8,
    resenas: [
      {
        id: "resena-5",
        comentario: "Ideal para los niños, tiene buenos juegos y está cercado.",
        calificacion: 4,
        fechaCreacion: "2024-08-26T11:00:00Z",
        usuario: {
          id: "user-5",
          nombre: "Laura Sánchez",
        },
      },
      {
        id: "resena-6",
        comentario:
          "Los juegos están un poco deteriorados, pero el espacio es amplio.",
        calificacion: 3,
        fechaCreacion: "2024-08-25T16:30:00Z",
        usuario: {
          id: "user-6",
          nombre: "Roberto Silva",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        },
      },
    ],
  },
]

function PlazaReviews({
  userId = "user-1",
  plazaId = null,
  showDebugInfo = false,
}: PlazaReviewsProps) {
  console.log(
    "🎯 PlazaReviews renderizado con userId:",
    userId,
    "plazaId:",
    plazaId
  )

  // Estados locales para UI
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Plaza[]>([])
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [resenaAEditar, setResenaAEditar] = useState<Resena | null>(null)
  const [textoResena, setTextoResena] = useState("")
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null)
  const [plazaSeleccionada, setPlazaSeleccionada] = useState<Plaza | null>(null)

  // Simular carga de datos
  useEffect(() => {
    console.log("🔄 useEffect - userId:", userId, "plazaId:", plazaId)

    setLoading(true)

    // Simular delay del backend
    setTimeout(() => {
      console.log("📋 Cargando datos...")

      if (plazaId) {
        console.log("🎯 Modo EDITAR - Obteniendo plaza específica:", plazaId)
        const plazaEspecifica = mockPlazas.find((p) => p.id === plazaId)
        if (plazaEspecifica) {
          setData([plazaEspecifica])
          setPlazaSeleccionada(plazaEspecifica)
        } else {
          // Si no encuentra la plaza específica, usar la primera disponible
          setData(mockPlazas)
          setPlazaSeleccionada(mockPlazas[0])
        }
      } else {
        console.log("📋 Modo LISTADO - Cargando todas las plazas")
        setData(mockPlazas)
        if (mockPlazas.length > 0) {
          setPlazaSeleccionada(mockPlazas[0])
        }
      }

      setLoading(false)
    }, 800)
  }, [userId, plazaId])

  // Función para manejar editar reseña
  const handleEditarResena = (resenaId: string, index: number) => {
    console.log(
      "🖊️ EJECUTANDO handleEditarResena para:",
      resenaId,
      "índice:",
      index
    )

    let resena: Resena | undefined

    if (resenaId.startsWith("fallback-")) {
      const resenaIndex = parseInt(resenaId.split("-")[1])
      resena = plazaSeleccionada?.resenas?.[resenaIndex]
      console.log(
        "📝 Usando índice para encontrar reseña:",
        resenaIndex,
        resena
      )
    } else {
      resena = plazaSeleccionada?.resenas?.find((r) => r.id === resenaId)
      console.log("📝 Buscando por ID real:", resenaId, resena)
    }

    if (resena) {
      setResenaAEditar(resena)
      setTextoResena(resena.comentario || "")
      setModalEditarAbierto(true)
      setDropdownAbierto(null)
      console.log(
        "✅ Modal de edición abierto para reseña:",
        resena.comentario?.substring(0, 50)
      )
    } else {
      console.error(
        "❌ No se encontró la reseña con ID:",
        resenaId,
        "e índice:",
        index
      )
    }
  }

  // Función para guardar la reseña editada (mock)
  const handleGuardarResena = async () => {
    if (resenaAEditar && textoResena.trim() && plazaSeleccionada) {
      try {
        console.log("💾 Guardando reseña editada...")

        setLoading(true)

        // Simular delay de guardado
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Actualizar los datos localmente
        const nuevasPlazas = data.map((plaza) => {
          if (plaza.id === plazaSeleccionada.id) {
            const nuevasResenas = plaza.resenas.map((resena) => {
              if (resena.id === resenaAEditar.id) {
                return { ...resena, comentario: textoResena }
              }
              return resena
            })
            return { ...plaza, resenas: nuevasResenas }
          }
          return plaza
        })

        setData(nuevasPlazas)
        const plazaActualizada = nuevasPlazas.find(
          (p) => p.id === plazaSeleccionada.id
        )
        if (plazaActualizada) {
          setPlazaSeleccionada(plazaActualizada)
        }

        setLoading(false)
        setModalEditarAbierto(false)
        setResenaAEditar(null)
        console.log("✅ Reseña actualizada correctamente")
      } catch (error) {
        console.error("❌ Error actualizando reseña:", error)
        setLoading(false)
      }
    }
  }

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setTextoResena(resenaAEditar?.comentario || "")
    setModalEditarAbierto(false)
    setResenaAEditar(null)
  }

  // Función para manejar eliminar reseña (mock)
  const handleEliminarResena = async (resenaId: string, index: number) => {
    console.log(
      "🗑️ EJECUTANDO handleEliminarResena para:",
      resenaId,
      "índice:",
      index
    )

    if (plazaSeleccionada) {
      try {
        let resenaParaEliminar: Resena | undefined

        if (resenaId.startsWith("fallback-")) {
          const resenaIndex = parseInt(resenaId.split("-")[1])
          resenaParaEliminar = plazaSeleccionada.resenas?.[resenaIndex]
        } else {
          resenaParaEliminar = plazaSeleccionada.resenas?.find(
            (r) => r.id === resenaId
          )
        }

        if (resenaParaEliminar?.id) {
          console.log("🗑️ Eliminando reseña con ID:", resenaParaEliminar.id)

          // Simular delay
          setLoading(true)
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Actualizar los datos localmente
          const nuevasPlazas = data.map((plaza) => {
            if (plaza.id === plazaSeleccionada.id) {
              const nuevasResenas = plaza.resenas.filter(
                (resena) => resena.id !== resenaParaEliminar.id
              )
              return {
                ...plaza,
                resenas: nuevasResenas,
                totalResenas: nuevasResenas.length,
                calificacionPromedio:
                  nuevasResenas.length > 0
                    ? nuevasResenas.reduce(
                        (sum, r) => sum + r.calificacion,
                        0
                      ) / nuevasResenas.length
                    : 0,
              }
            }
            return plaza
          })

          setData(nuevasPlazas)
          const plazaActualizada = nuevasPlazas.find(
            (p) => p.id === plazaSeleccionada.id
          )
          if (plazaActualizada) {
            setPlazaSeleccionada(plazaActualizada)
          }

          setLoading(false)
          setDropdownAbierto(null)
          console.log("✅ Reseña eliminada correctamente")
        } else {
          console.error(
            "❌ No se pudo obtener ID real de la reseña para eliminar"
          )
        }
      } catch (error) {
        console.error("❌ Error eliminando reseña:", error)
        setLoading(false)
      }
    }
  }

  // Función simple para toggle del dropdown
  const toggleDropdown = (resenaId: string) => {
    console.log("🔄 Toggle dropdown para reseña:", resenaId)
    console.log("🔍 Estado actual dropdownAbierto:", dropdownAbierto)

    if (dropdownAbierto === resenaId) {
      console.log("❌ Cerrando dropdown")
      setDropdownAbierto(null)
    } else {
      console.log("✅ Abriendo dropdown")
      setDropdownAbierto(resenaId)
    }
  }

  // Función para renderizar estrellas con keys únicas
  const renderEstrellas = (calificacion: number, baseKey: string = "") => {
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

  // Función para obtener las iniciales del usuario
  const getIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función de reintento (simplificada)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReintentar = () => {
    console.log("🔄 Recargando datos...")
    setLoading(true)

    setTimeout(() => {
      setData(mockPlazas)
      if (mockPlazas.length > 0) {
        setPlazaSeleccionada(mockPlazas[0])
      }
      setLoading(false)
    }, 800)
  }

  // Estados de carga
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

  // Estado: Sin plazas (mostrar estado de sin reseñas directamente)
  if (!data || data.length === 0 || !plazaSeleccionada) {
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
                  Esta sección estará disponible cuando haya reseñas para
                  mostrar
                </p>
              </div>

              {showDebugInfo && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 max-w-md mx-auto">
                  <div className="space-y-1">
                    <div>
                      <strong>Debug Info:</strong>
                    </div>
                    <div>Usuario ID: {userId || "N/A"}</div>
                    <div>Plaza ID: {plazaId || "N/A"}</div>
                    <div>Modo: {plazaId ? "EDITAR" : "LISTADO"}</div>
                    <div>Total plazas: {data?.length || 0}</div>
                    <div>Estado: Sin datos disponibles</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Estado: Sin reseñas en la plaza seleccionada
  if (!plazaSeleccionada?.resenas || plazaSeleccionada.resenas.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">0.0</span>
                <Star className="w-7 h-7 text-gray-300" />
              </div>
              <span className="text-gray-600 text-lg">0 Reseñas</span>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {plazaSeleccionada?.nombre}
              </h3>
              <p className="text-gray-600 mt-1">
                {plazaSeleccionada?.direccion}
              </p>
            </div>
          </div>

          <div className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Sin reseñas aún
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Esta plaza aún no tiene reseñas de usuarios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Determinar cuántas reseñas mostrar
  const resenasAMostrar = mostrarTodas
    ? plazaSeleccionada.resenas
    : plazaSeleccionada.resenas.slice(0, 3)

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {plazaSeleccionada.calificacionPromedio?.toFixed(1) || "0.0"}
                </span>
                <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
              </div>
              <span className="text-gray-600 text-lg">
                {plazaSeleccionada.totalResenas ||
                  plazaSeleccionada.resenas.length}{" "}
                Reseñas
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {plazaSeleccionada.nombre}
              </h3>
              <p className="text-gray-600 mt-1">
                {plazaSeleccionada.direccion}
              </p>
            </div>
          </div>

          {/* Lista de reseñas */}
          <div className="p-6 space-y-8">
            {resenasAMostrar.map((resena: Resena, index: number) => {
              const resenaId = resena.id || `fallback-${index}`
              const isDropdownOpen = dropdownAbierto === resenaId

              return (
                <div
                  key={`resena-${resenaId}`}
                  className="space-y-4"
                >
                  {/* Header de la reseña */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar del usuario */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {resena.usuario?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resena.usuario.avatar}
                            alt={resena.usuario.nombre || "Usuario"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-semibold">
                            {getIniciales(resena.usuario?.nombre || "Usuario")}
                          </span>
                        )}
                      </div>

                      {/* Nombre y fecha */}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {resena.usuario?.nombre || "Usuario anónimo"}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {resena.fechaCreacion
                            ? new Date(resena.fechaCreacion).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Fecha no disponible"}
                        </p>
                      </div>
                    </div>

                    {/* Menú de opciones */}
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => {
                          console.log(
                            `🖱️ Click en opciones para reseña: ${resenaId}`
                          )
                          toggleDropdown(resenaId)
                        }}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {/* Dropdown */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-12 z-50 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                          <button
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              console.log(
                                `🖱️ Click en EDITAR para reseña: ${resenaId}`
                              )
                              handleEditarResena(resenaId, index)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Editar reseña
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => {
                              console.log(
                                `🖱️ Click en ELIMINAR para reseña: ${resenaId}`
                              )
                              handleEliminarResena(resenaId, index)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Eliminar reseña
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calificación */}
                  <div className="flex items-center gap-1">
                    {renderEstrellas(
                      resena.calificacion || 0,
                      `resena-${resenaId}`
                    )}
                  </div>

                  {/* Comentario */}
                  <p className="text-gray-700 leading-relaxed">
                    {resena.comentario || "Sin comentario"}
                  </p>

                  {/* Debug info (solo si está activado) */}
                  {showDebugInfo && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <strong>Debug:</strong> ID: {resenaId} | Dropdown:{" "}
                      {isDropdownOpen ? "Abierto" : "Cerrado"}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Botón cargar más */}
            {!mostrarTodas && plazaSeleccionada.resenas.length > 3 && (
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

            {/* Debug info global */}
            {showDebugInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Debug Info:</strong>
                </div>
                <div>Plaza ID: {plazaSeleccionada?.id || "N/A"}</div>
                <div>Usuario ID: {userId}</div>
                <div>Plaza ID solicitada: {plazaId || "N/A"}</div>
                <div>Modo: {plazaId ? "EDITAR" : "LISTADO"}</div>
                <div>Total plazas: {data.length}</div>
                <div>
                  Reseñas de esta plaza:{" "}
                  {plazaSeleccionada?.resenas?.length || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para editar reseña */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Editar reseña
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reseña
                  </label>
                  <textarea
                    value={textoResena}
                    onChange={(e) => setTextoResena(e.target.value)}
                    placeholder="Escribe tu reseña aquí..."
                    className="w-full min-h-32 resize-none border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleCancelarEdicion}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarResena}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || !textoResena.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PlazaReviews
