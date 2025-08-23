"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { X, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportesService } from "../../services/reports-service"

interface ReporteDetailsModalProps {
  reporteId: string | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void // Para refrescar la tabla después de actualizar
}

interface ReporteDetalle {
  id: string
  descripcion: string 
  categoria: string
  categoriaLabel: string
  estado: string
  fecha: string
  resolvedAt: string | null
  respuestaAdmin: string | null
  usuario: {
    uid: string
    nombre: string
    email?: string
  }
  plaza?: {
    id: string
    nombre: string
    ubicacion?: string
  }
  resolvedBy: {
    uid: string
    nombre: string
  } | null
}

const ReporteDetailsModal: React.FC<ReporteDetailsModalProps> = ({
  reporteId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [reporte, setReporte] = useState<ReporteDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [respuestaAdmin, setRespuestaAdmin] = useState("")
  const [updating, setUpdating] = useState(false)
  const [marcarResuelto, setMarcarResuelto] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  // Cargar detalles del reporte
  useEffect(() => {
    if (isOpen && reporteId) {
      loadReporteDetails()
    }
  }, [isOpen, reporteId])

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setReporte(null)
      setRespuestaAdmin("")
      setError(null)
      setMarcarResuelto(false)
      setCancelando(false)
    }
  }, [isOpen])

  const loadReporteDetails = async () => {
    if (!reporteId) return

    setLoading(true)
    setError(null)

    try {
      const response = await ReportesService.getReporteById(reporteId)

      if (response.ok) {
        setReporte(response.data)
        setRespuestaAdmin(response.data.respuestaAdmin || "")
      } else {
        setError(response.msg || "Error al cargar el reporte")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!reporteId || !respuestaAdmin.trim()) return

    setUpdating(true)

    try {
      const updateData: { respuestaAdmin: string; estado?: string } = {
        respuestaAdmin: respuestaAdmin.trim(),
      }

      // Si marcó resolver, cambiar estado
      if (marcarResuelto) {
        updateData.estado = "resuelto"
      }

      const response = await ReportesService.updateReporte(
        reporteId,
        updateData
      )

      if (response.ok) {
        // Actualizar el reporte local
        setReporte((prev) =>
          prev
            ? {
                ...prev,
                respuestaAdmin: respuestaAdmin.trim(),
                estado: marcarResuelto ? "resuelto" : prev.estado,
                resolvedAt: marcarResuelto
                  ? new Date().toISOString()
                  : prev.resolvedAt,
              }
            : null
        )

        // Notificar al componente padre para refrescar
        onUpdate?.()

        // Cerrar modal después de un momento
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(response.msg || "Error al actualizar el reporte")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelarReporte = async () => {
    if (!reporteId) return

    setCancelando(true)

    try {
      console.log("Cancelando reporte desde modal:", reporteId) // Debug

      const updateData = {
        estado: "Cancelado", // Probemos con mayúscula
      }

      const response = await ReportesService.updateReporte(
        reporteId,
        updateData
      )

      console.log("Respuesta del servidor:", response) // Debug

      if (response.ok) {
        // Actualizar el reporte local
        setReporte((prev) =>
          prev
            ? {
                ...prev,
                estado: "Cancelado",
              }
            : null
        )

        // Notificar al componente padre para refrescar
        onUpdate?.()

        // Cerrar modal después de un momento
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        console.error("Error en respuesta:", response.msg)
        setError(response.msg || "Error al cancelar el reporte")
      }
    } catch (error) {
      console.error("Error al cancelar reporte:", error)
      setError(error instanceof Error ? error.message : "Error inesperado")
    } finally {
      setCancelando(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "resuelto":
        return "bg-green-100 text-green-800 border-green-300"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Reporte</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando detalles...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                onClick={loadReporteDetails}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : reporte ? (
            <div className="space-y-6">
              {/* Usuario Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {reporte.usuario.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{reporte.usuario.nombre}</h3>
                  {reporte.usuario.email && (
                    <p className="text-sm text-gray-600">
                      {reporte.usuario.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Descripción del reporte
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {reporte.descripcion}
                </p>
              </div>

              {/* Estado con mejores indicadores visuales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Categoría
                  </label>
                  <p className="text-gray-900">{reporte.categoriaLabel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha
                  </label>
                  <p className="text-gray-900">{formatDate(reporte.fecha)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Estado del Reporte
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-2 rounded-lg text-sm font-medium border ${getEstadoColor(
                        reporte.estado
                      )}`}
                    >
                      {reporte.estado}
                    </span>
                    {reporte.estado === "Pendiente" && (
                      <span className="text-sm text-yellow-600">
                        ● Esperando acción del administrador
                      </span>
                    )}
                    {reporte.estado === "resuelto" && (
                      <span className="text-sm text-green-600">
                        ✓ Reporte resuelto exitosamente
                      </span>
                    )}
                    {reporte.estado === "cancelado" && (
                      <span className="text-sm text-red-600">
                        ✗ Reporte cancelado por el administrador
                      </span>
                    )}
                  </div>
                </div>
                {reporte.plaza && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Plaza reportada
                    </label>
                    <p className="text-gray-900">{reporte.plaza.nombre}</p>
                    {reporte.plaza.ubicacion && (
                      <p className="text-sm text-gray-600">
                        {reporte.plaza.ubicacion}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Respuesta del Admin */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respuesta del administrador
                  </label>
                  <textarea
                    value={respuestaAdmin}
                    onChange={(e: {
                      target: { value: React.SetStateAction<string> }
                    }) => setRespuestaAdmin(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={4}
                    className="w-full"
                    disabled={updating}
                  />
                </div>

                {/* Checkbox para marcar como resuelto */}
                {reporte.estado === "Pendiente" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marcarResuelto"
                      checked={marcarResuelto}
                      onChange={(e) => setMarcarResuelto(e.target.checked)}
                      className="rounded border-gray-300"
                      disabled={updating}
                    />
                    <label
                      htmlFor="marcarResuelto"
                      className="text-sm text-gray-700"
                    >
                      Marcar reporte como resuelto al enviar este mensaje
                    </label>
                  </div>
                )}

                {/* Acciones según el estado */}
                {reporte.estado === "Pendiente" && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleCancelarReporte}
                      disabled={cancelando || updating}
                      className="flex items-center gap-2"
                    >
                      {cancelando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {cancelando ? "Cancelando..." : "Cancelar Reporte"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !respuestaAdmin.trim() || updating || cancelando
                      }
                      className="flex items-center gap-2"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {updating ? "Enviando..." : "Enviar Respuesta"}
                    </Button>
                  </div>
                )}

                {/* Si ya está resuelto o cancelado, solo mostrar botón de respuesta */}
                {reporte.estado !== "Pendiente" && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!respuestaAdmin.trim() || updating}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {updating ? "Actualizando..." : "Actualizar Respuesta"}
                    </Button>
                  </div>
                )}
              </form>

              {/* Info de resolución */}
              {reporte.resolvedAt && reporte.resolvedBy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Resuelto por:</strong> {reporte.resolvedBy.nombre}
                  </p>
                  <p className="text-sm text-green-600">
                    <strong>Fecha de resolución:</strong>{" "}
                    {formatDate(reporte.resolvedAt)}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ReporteDetailsModal
