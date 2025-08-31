/* eslint-disable @typescript-eslint/no-explicit-any */
// Modal con plazas reales del backend y Sonner

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Edit3, User, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ReservaTable } from "../../types"

interface Plaza {
  id: string
  nombre: string
  direccion: string
  descripcion: string
  tipo: string
}

interface EditReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservationData: ReservaTable | null
  onUpdate?: (updatedReservation: any) => void
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  isOpen,
  onClose,
  reservationData,
  onUpdate,
}) => {
  const [selectedPlazaId, setSelectedPlazaId] = useState("")
  const [plazasDisponibles, setPlazasDisponibles] = useState<Plaza[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlazas, setIsLoadingPlazas] = useState(false)

  // Cargar plazas disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarPlazas()
    }
  }, [isOpen])

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && reservationData) {
      const plaza = reservationData.plaza as any
      setSelectedPlazaId(plaza?.id || "")
    }
  }, [isOpen, reservationData])

  const cargarPlazas = async () => {
    setIsLoadingPlazas(true)
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token")

      const response = await fetch(
        "https://aparcoyo-back.onrender.com/apa/plazas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPlazasDisponibles(data.data || [])
      } else {
        console.error("Error cargando plazas")
        setPlazasDisponibles([])
        toast.error("Error cargando las plazas disponibles")
      }
    } catch (error) {
      console.error("Error cargando plazas:", error)
      setPlazasDisponibles([])
      toast.error("Error de conexión al cargar plazas")
    } finally {
      setIsLoadingPlazas(false)
    }
  }

  const updateReservation = async () => {
    if (!reservationData?.id) return

    const usuario = reservationData.usuario as any
    const userName = usuario?.nombre || "Usuario"

    setIsLoading(true)

    // Usar toast.promise para manejar todo el proceso
    try {
      await toast.promise(
        async () => {
          const token =
            localStorage.getItem("authToken") || localStorage.getItem("token")

          if (!token) {
            throw new Error(
              "No estás autenticado. Por favor, inicia sesión nuevamente."
            )
          }

          // Preparar datos de actualización
          const updateData: any = {}

          // Solo agregar plaza si realmente cambió
          const plazaActual = (reservationData.plaza as any)?.id
          if (selectedPlazaId && selectedPlazaId !== plazaActual) {
            updateData.plaza = selectedPlazaId
            console.log(
              "🔄 Cambiando plaza de",
              plazaActual,
              "a",
              selectedPlazaId
            )
          } else {
            // Si no cambió, mantener la plaza actual
            updateData.plaza = plazaActual
          }

          console.log("🔍 Datos que vamos a enviar:", updateData)

          const response = await fetch(
            `https://aparcoyo-back.onrender.com/apa/reservas/${reservationData.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updateData),
            }
          )

          console.log("📡 PATCH Response status:", response.status)

          if (!response.ok) {
            const errorData = await response.json()
            console.error("❌ Error del servidor:", errorData)

            if (response.status === 401) {
              localStorage.removeItem("authToken")
              localStorage.removeItem("token")
              throw new Error(
                "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
              )
            }
            throw new Error(
              `Error ${response.status}: ${
                errorData.message || response.statusText
              }`
            )
          }

          const result = await response.json()
          console.log("✅ Reserva actualizada exitosamente:", result)

          // Llamar callback y cerrar modal
          onUpdate?.(result.data)
          onClose()

          return `Reserva de ${userName} actualizada correctamente`
        },
        {
          loading: `Actualizando reserva de ${userName}...`,
          success: (message) => message,
          error: (error) => `Error: ${error.message}`,
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!reservationData) return null

  const usuario = reservationData.usuario as any
  const userName = usuario?.nombre || "Sin nombre"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md w-full max-w-sm mx-auto bg-white rounded-lg shadow-xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-blue-600" />
            </div>
            <DialogTitle className="text-gray-900 font-medium text-base">
              Editar Detalles de Reserva
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm font-medium text-gray-900 mb-4">
            Detalles de la reserva
          </div>

          {/* Plaza reservada */}
          <div className="space-y-2">
            <Label
              htmlFor="plaza"
              className="text-sm text-gray-600"
            >
              Plaza reservada
            </Label>

            {isLoadingPlazas ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">
                  Cargando plazas...
                </span>
              </div>
            ) : (
              <Select
                value={selectedPlazaId}
                onValueChange={setSelectedPlazaId}
              >
                <SelectTrigger className="w-full h-auto min-h-[60px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="flex items-start gap-2 p-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      {selectedPlazaId ? (
                        <>
                          <div className="font-medium text-sm text-gray-700">
                            {plazasDisponibles.find(
                              (p) => p.id === selectedPlazaId
                            )?.nombre || "Sin nombre"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {
                              plazasDisponibles.find(
                                (p) => p.id === selectedPlazaId
                              )?.direccion
                            }
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Seleccionar plaza...
                        </span>
                      )}
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {plazasDisponibles.map((plaza) => (
                    <SelectItem
                      key={plaza.id}
                      value={plaza.id}
                    >
                      <div className="flex items-start gap-2 py-1">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">
                            {plaza.nombre || "Sin nombre"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plaza.direccion}
                          </div>
                          <div className="text-xs text-blue-600">
                            {plaza.tipo}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Usuario info (solo lectura) */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Reservado por</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {userName}
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={updateReservation}
            disabled={isLoading || isLoadingPlazas}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </div>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditReservationModal
