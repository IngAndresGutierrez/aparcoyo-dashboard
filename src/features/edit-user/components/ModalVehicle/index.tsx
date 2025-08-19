"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Trash2, Plus, Car } from "lucide-react"
import {
  CreateVehiculoRequest,
  UpdateVehiculoRequest,
  Vehiculo,
} from "../../types/edit-vehicle"
import useVehiculos from "../../hooks/useEditVehicle"

interface EditVehiculoModalProps {
  isOpen: boolean
  onClose: () => void
  vehiculos: Vehiculo[]
  userId?: string // Para modo admin
  onSuccess?: () => void // Callback cuando se guarda exitosamente
}

interface VehiculoFormState {
  id?: string // undefined para nuevos vehículos
  matricula: string
  modelo: string
  marca: string
  año: number
  color: string
  tipoVehiculo: "auto" | "moto" | "camion" | "furgoneta"
  numeroMotor?: string
  numeroChasis?: string
  isNew?: boolean // Para identificar vehículos nuevos
}

const EditVehiculoModal: React.FC<EditVehiculoModalProps> = ({
  isOpen,
  onClose,
  vehiculos,
  userId,
  onSuccess,
}) => {
  const {
    updateVehiculo,
    updateVehiculoAdmin,
    deleteVehiculo,
    deleteVehiculoAdmin,
    createVehiculo,
    loading,
  } = useVehiculos()

  const [vehiculosForm, setVehiculosForm] = React.useState<VehiculoFormState[]>(
    []
  )
  const [hasChanges, setHasChanges] = React.useState(false)

  // Inicializar el formulario cuando se abra el modal o cambien los vehículos
  React.useEffect(() => {
    if (isOpen) {
      if (vehiculos.length > 0) {
        // Si hay vehículos, cargar los existentes
        const initialForm = vehiculos.map((vehiculo) => ({
          id: vehiculo.id,
          matricula: vehiculo.placa,
          modelo: vehiculo.modelo,
          marca: vehiculo.marca,
          año: vehiculo.año,
          color: vehiculo.color,
          tipoVehiculo: vehiculo.tipoVehiculo,
          numeroMotor: vehiculo.numeroMotor || "",
          numeroChasis: vehiculo.numeroChasis || "",
          isNew: false,
        }))
        setVehiculosForm(initialForm)
      } else {
        // Si no hay vehículos, inicializar vacío
        setVehiculosForm([])
      }
      setHasChanges(false)
    }
  }, [isOpen, vehiculos])

  // Manejar cambios en los inputs
  const handleInputChange = (
    index: number,
    field: keyof VehiculoFormState,
    value: string | number
  ) => {
    setVehiculosForm((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    setHasChanges(true)
  }

  // Agregar nuevo vehículo
  const handleAddVehiculo = () => {
    const newVehiculo: VehiculoFormState = {
      matricula: "",
      modelo: "",
      marca: "",
      año: new Date().getFullYear(),
      color: "",
      tipoVehiculo: "auto",
      numeroMotor: "",
      numeroChasis: "",
      isNew: true,
    }
    setVehiculosForm((prev) => [...prev, newVehiculo])
    setHasChanges(true)
  }

  // Eliminar vehículo
  const handleDeleteVehiculo = async (index: number) => {
    const vehiculo = vehiculosForm[index]

    // Si es un vehículo nuevo, solo removerlo del formulario
    if (vehiculo.isNew || !vehiculo.id) {
      setVehiculosForm((prev) => prev.filter((_, i) => i !== index))
      setHasChanges(true)
      return
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este vehículo?"
    )
    if (!confirmDelete) return

    try {
      let success = false

      if (userId) {
        // Modo admin
        success = await deleteVehiculoAdmin(userId, vehiculo.id)
      } else {
        // Modo usuario normal
        success = await deleteVehiculo(vehiculo.id)
      }

      if (success) {
        // Remover del formulario local
        setVehiculosForm((prev) => prev.filter((_, i) => i !== index))
        setHasChanges(true)
      }
    } catch (error) {
      console.error("Error al eliminar vehículo:", error)
      alert("Error al eliminar el vehículo")
    }
  }

  // Guardar cambios
  const handleSave = async () => {
    if (!hasChanges && vehiculosForm.length === vehiculos.length) {
      onClose()
      return
    }

    try {
      // Procesar cada vehículo
      const promises = vehiculosForm.map(async (formVehiculo) => {
        if (formVehiculo.isNew || !formVehiculo.id) {
          // Crear nuevo vehículo
          const createData: CreateVehiculoRequest = {
            placa: formVehiculo.matricula,
            modelo: formVehiculo.modelo,
            marca: formVehiculo.marca,
            año: formVehiculo.año,
            color: formVehiculo.color,
            tipoVehiculo: formVehiculo.tipoVehiculo,
            numeroMotor: formVehiculo.numeroMotor || undefined,
            numeroChasis: formVehiculo.numeroChasis || undefined,
          }
          return createVehiculo(createData)
        } else {
          // Actualizar vehículo existente
          const originalVehiculo = vehiculos.find(
            (v) => v.id === formVehiculo.id
          )
          if (!originalVehiculo) return

          // Verificar si hay cambios
          const hasVehiculoChanges =
            originalVehiculo.placa !== formVehiculo.matricula ||
            originalVehiculo.modelo !== formVehiculo.modelo ||
            originalVehiculo.marca !== formVehiculo.marca ||
            originalVehiculo.año !== formVehiculo.año ||
            originalVehiculo.color !== formVehiculo.color ||
            originalVehiculo.tipoVehiculo !== formVehiculo.tipoVehiculo ||
            (originalVehiculo.numeroMotor || "") !== formVehiculo.numeroMotor ||
            (originalVehiculo.numeroChasis || "") !== formVehiculo.numeroChasis

          if (!hasVehiculoChanges) return

          // Preparar datos para actualizar
          const updateData: UpdateVehiculoRequest = {
            placa: formVehiculo.matricula,
            modelo: formVehiculo.modelo,
            marca: formVehiculo.marca,
            año: formVehiculo.año,
            color: formVehiculo.color,
            tipoVehiculo: formVehiculo.tipoVehiculo,
            numeroMotor: formVehiculo.numeroMotor || undefined,
            numeroChasis: formVehiculo.numeroChasis || undefined,
          }

          // Actualizar según el modo
          if (userId) {
            return updateVehiculoAdmin(userId, formVehiculo.id, updateData)
          } else {
            return updateVehiculo(formVehiculo.id, updateData)
          }
        }
      })

      // Esperar a que todas las operaciones terminen
      await Promise.all(promises)

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      console.error("Error al guardar vehículos:", error)
      alert("Error al guardar los cambios")
    }
  }

  // Mostrar estado vacío
  if (vehiculosForm.length === 0) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <span>Editar vehículos</span>
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="h-16 w-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Este usuario no ha registrado vehículos aún
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Puedes añadir un vehículo desde aquí para que aparezca en su
              perfil y pueda utilizarlo en futuras reservas.
            </p>

            <Button
              onClick={handleAddVehiculo}
              className="mb-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir vehículo
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Mostrar formulario con vehículos
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <span>Editar vehículos</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {vehiculosForm.map((vehiculo, index) => (
            <div
              key={`${vehiculo.id || "new"}-${index}`}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Vehículo {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVehiculo(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`matricula-${index}`}
                    className="text-sm font-medium"
                  >
                    Matrícula
                  </Label>
                  <Input
                    id={`matricula-${index}`}
                    type="text"
                    value={vehiculo.matricula}
                    onChange={(e) =>
                      handleInputChange(index, "matricula", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Ej: ABC123"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`modelo-${index}`}
                    className="text-sm font-medium"
                  >
                    Modelo
                  </Label>
                  <Input
                    id={`modelo-${index}`}
                    type="text"
                    value={vehiculo.modelo}
                    onChange={(e) =>
                      handleInputChange(index, "modelo", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Ej: Corolla 2020"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`marca-${index}`}
                    className="text-sm font-medium"
                  >
                    Marca
                  </Label>
                  <Input
                    id={`marca-${index}`}
                    type="text"
                    value={vehiculo.marca}
                    onChange={(e) =>
                      handleInputChange(index, "marca", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Ej: Toyota"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`color-${index}`}
                    className="text-sm font-medium"
                  >
                    Color
                  </Label>
                  <Input
                    id={`color-${index}`}
                    type="text"
                    value={vehiculo.color}
                    onChange={(e) =>
                      handleInputChange(index, "color", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Ej: Rojo"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddVehiculo}
            className="w-full"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir otro vehículo
          </Button>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditVehiculoModal
