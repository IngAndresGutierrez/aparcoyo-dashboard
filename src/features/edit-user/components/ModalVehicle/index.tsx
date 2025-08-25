/* eslint-disable @typescript-eslint/no-explicit-any */
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
  isNew?: boolean // Para identificar vehículos nuevos
  tempId?: string // ID temporal para nuevos vehículos
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

  const [vehiculosForm, setVehiculosForm] = React.useState<VehiculoFormState[]>([])
  const [hasChanges, setHasChanges] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saveError, setSaveError] = React.useState<string | null>(null) // Nuevo estado para errores de guardado

  // Inicializar el formulario cuando se abra el modal o cambien los vehículos
  React.useEffect(() => {
    if (isOpen) {
      console.log("🚗 Inicializando modal con vehículos:", vehiculos)
      
      if (vehiculos && vehiculos.length > 0) {
        // Si hay vehículos, cargar los existentes
        const initialForm = vehiculos.map((vehiculo) => ({
          id: vehiculo.id,
          matricula: vehiculo.placa || "",
          modelo: vehiculo.modelo || "",
          isNew: false,
        }))
        setVehiculosForm(initialForm)
        console.log("📋 Formulario inicializado:", initialForm)
      } else {
        // Si no hay vehículos, inicializar vacío
        setVehiculosForm([])
      }
      setHasChanges(false)
      setErrors({})
      setSaveError(null) // Limpiar errores de guardado
    }
  }, [isOpen, vehiculos])

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    vehiculosForm.forEach((vehiculo, index) => {
      const prefix = `vehiculo-${index}`
      
      if (!vehiculo.matricula?.trim()) {
        newErrors[`${prefix}-matricula`] = "La matrícula es requerida"
      } else if (vehiculo.matricula.length < 6) {
        newErrors[`${prefix}-matricula`] = "La matrícula debe tener al menos 6 caracteres"
      }
      
      if (!vehiculo.modelo?.trim()) {
        newErrors[`${prefix}-modelo`] = "El modelo es requerido"
      } else if (vehiculo.modelo.length < 2) {
        newErrors[`${prefix}-modelo`] = "El modelo debe tener al menos 2 caracteres"
      }

      // Verificar duplicados de matrícula
      const duplicateIndex = vehiculosForm.findIndex((v, i) => 
        i !== index && v.matricula?.trim().toUpperCase() === vehiculo.matricula?.trim().toUpperCase()
      )
      if (duplicateIndex !== -1) {
        newErrors[`${prefix}-matricula`] = "Esta matrícula ya está en uso"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en los inputs
  const handleInputChange = (
    index: number,
    field: keyof VehiculoFormState,
    value: string
  ) => {
    setVehiculosForm((prev) => {
      const updated = [...prev]
      updated[index] = { 
        ...updated[index], 
        [field]: field === 'matricula' ? value.toUpperCase().trim() : value.trim()
      }
      return updated
    })
    setHasChanges(true)

    // Limpiar error específico cuando el usuario empiece a escribir
    const errorKey = `vehiculo-${index}-${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Agregar nuevo vehículo
  const handleAddVehiculo = () => {
    // Contar vehículos reales (excluyendo los que están marcados para eliminación)
    const vehiculosReales = vehiculosForm.length
    
    // Verificar límite de vehículos (3 máximo según el backend)
    if (vehiculosReales >= 3) {
      alert("No puedes tener más de 3 vehículos registrados.")
      return
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newVehiculo: VehiculoFormState = {
      matricula: "",
      modelo: "",
      isNew: true,
      tempId: tempId,
    }
    setVehiculosForm((prev) => [...prev, newVehiculo])
    setHasChanges(true)
    console.log("➕ Nuevo vehículo agregado:", newVehiculo)
  }

  // Eliminar vehículo
  const handleDeleteVehiculo = async (index: number) => {
    const vehiculo = vehiculosForm[index]
    console.log("🗑️ Eliminando vehículo en índice:", index, vehiculo)

    // Si es un vehículo nuevo, solo removerlo del formulario
    if (vehiculo.isNew || !vehiculo.id) {
      setVehiculosForm((prev) => prev.filter((_, i) => i !== index))
      setHasChanges(true)
      console.log("✅ Vehículo nuevo removido del formulario")
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el vehículo ${vehiculo.matricula}?`
    )
    if (!confirmDelete) return

    try {
      // Las funciones de delete ahora no retornan boolean, solo lanzan error si fallan
      if (userId) {
        console.log("🔧 Eliminando vehículo como admin:", userId, vehiculo.id)
        await deleteVehiculoAdmin(userId, vehiculo.id)
      } else {
        console.log("🔧 Eliminando vehículo como usuario:", vehiculo.id)
        await deleteVehiculo(vehiculo.id)
      }

      // Si llegamos aquí, la eliminación fue exitosa
      setVehiculosForm((prev) => prev.filter((_, i) => i !== index))
      setHasChanges(true)
      console.log("✅ Vehículo eliminado exitosamente")
      
    } catch (error) {
      console.error("❌ Error al eliminar vehículo:", error)
      alert(`Error al eliminar vehículo: ${error}`)
    }
  }

  // Guardar cambios
  const handleSave = async () => {
    console.log("💾 Iniciando proceso de guardado...")
    console.log("📊 Estado actual del formulario:", vehiculosForm)
    console.log("📊 Vehículos originales:", vehiculos)

    // Validar formulario antes de continuar
    if (!validateForm()) {
      console.error("❌ Formulario inválido, deteniendo guardado")
      return
    }

    if (!hasChanges && vehiculosForm.length === vehiculos.length) {
      console.log("ℹ️ No hay cambios, cerrando modal")
      onClose()
      return
    }

    try {
      const operations = []

      // Procesar cada vehículo
      for (let index = 0; index < vehiculosForm.length; index++) {
        const formVehiculo = vehiculosForm[index]
        console.log(`🔍 Procesando vehículo ${index + 1}:`, formVehiculo)

        if (formVehiculo.isNew || !formVehiculo.id) {
          // ✅ Crear nuevo vehículo
          const createData: CreateVehiculoRequest = {
            placa: formVehiculo.matricula.trim().toUpperCase(),
            modelo: formVehiculo.modelo.trim(),
          }
          
          console.log("➕ Creando vehículo con datos:", createData)
          
          const createOperation = async () => {
            try {
              const result = await createVehiculo(createData)
              console.log("🔍 Resultado de creación:", result)
              
              // El hook ahora retorna el objeto Vehiculo creado
              console.log("✅ Vehículo creado exitosamente:", result)
              return result
            } catch (error: any) {
              console.error("❌ Error creando vehículo:", error)
              
              // Manejar error específico del límite de vehículos
              if (error?.status === 400 && error?.message?.includes('máximo de 3 vehículos')) {
                throw new Error("No puedes tener más de 3 vehículos registrados. Elimina uno existente para agregar otro.")
              }
              
              // Verificar si el error contiene información del backend
              if (error?.message) {
                throw new Error(`Error al crear vehículo ${formVehiculo.matricula}: ${error.message}`)
              }
              
              // Error genérico
              throw new Error(`Error al crear vehículo ${formVehiculo.matricula}: ${error?.toString() || "Error desconocido"}`)
            }
          }
          
          operations.push(createOperation())
          
        } else {
          // ✅ Actualizar vehículo existente
          const originalVehiculo = vehiculos.find((v) => v.id === formVehiculo.id)
          if (!originalVehiculo) {
            console.warn("⚠️ Vehículo original no encontrado, saltando")
            continue
          }

          // Verificar cambios
          const hasVehiculoChanges =
            originalVehiculo.placa !== formVehiculo.matricula.trim().toUpperCase() ||
            originalVehiculo.modelo !== formVehiculo.modelo.trim()

          if (!hasVehiculoChanges) {
            console.log("ℹ️ Sin cambios en vehículo, saltando actualización")
            continue
          }

          // Preparar datos para actualizar
          const updateData: UpdateVehiculoRequest = {
            placa: formVehiculo.matricula.trim().toUpperCase(),
            modelo: formVehiculo.modelo.trim(),
          }

          console.log("🔄 Actualizando vehículo con datos:", updateData)

          const updateOperation = async () => {
            try {
              let result
              if (userId) {
                result = await updateVehiculoAdmin(userId, formVehiculo.id!, updateData)
              } else {
                result = await updateVehiculo(formVehiculo.id!, updateData)
              }
              console.log("✅ Vehículo actualizado exitosamente:", result)
              return result
            } catch (error) {
              console.error("❌ Error actualizando vehículo:", error)
              throw new Error(`Error al actualizar vehículo ${formVehiculo.matricula}: ${error}`)
            }
          }

          operations.push(updateOperation())
        }
      }

      // Esperar a que todas las operaciones terminen
      if (operations.length > 0) {
        console.log(`🚀 Ejecutando ${operations.length} operaciones...`)
        const results = await Promise.allSettled(operations)
        
        // Verificar resultados
        const failures = results.filter(result => result.status === 'rejected')
        if (failures.length > 0) {
          console.error("❌ Algunas operaciones fallaron:", failures)
          
          // Mostrar errores específicos al usuario
          failures.forEach((failure, index) => {
            if (failure.status === 'rejected') {
              console.error(`Operación ${index + 1} falló:`, failure.reason)
              
              // Extraer el mensaje del error
              let errorMessage = "Error desconocido"
              if (failure.reason && typeof failure.reason === 'object' && 'message' in failure.reason) {
                errorMessage = (failure.reason as any).message
              } else if (typeof failure.reason === 'string') {
                errorMessage = failure.reason
              }
              
              // Mostrar error específico y amigable
              alert(`❌ Error: ${errorMessage}`)
            }
          })
          
          // No cerrar el modal si hay errores
          return
        }
        
        console.log("✅ Todas las operaciones completadas exitosamente")
      } else {
        console.log("ℹ️ No hay operaciones que realizar")
      }

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }

      // Cerrar modal
      onClose()
      
    } catch (error) {
      console.error("❌ Error general al guardar vehículos:", error)
    }
  }

  const getErrorForField = (index: number, field: string): string | undefined => {
    return errors[`vehiculo-${index}-${field}`]
  }

  // Mostrar estado vacío
  if (vehiculosForm.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
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
              {userId ? "Este usuario no ha registrado vehículos aún" : "No tienes vehículos registrados"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {userId 
                ? "Puedes añadir hasta 3 vehículos desde aquí para que aparezcan en su perfil y pueda utilizarlos en futuras reservas."
                : "Añade tu primer vehículo para poder hacer reservas de aparcamiento. Puedes registrar hasta 3 vehículos."
              }
            </p>

            <Button onClick={handleAddVehiculo} className="mb-6" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir vehículo
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <span>Editar vehículos ({vehiculosForm.length})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mostrar error de guardado si existe */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm font-medium">
                  Error al guardar
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                {saveError}
              </p>
            </div>
          )}

          {/* Información del límite de vehículos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Vehículos registrados: {vehiculosForm.length}/3
              </span>
            </div>
            {vehiculosForm.length === 3 && (
              <p className="text-xs text-blue-600 mt-1">
                Has alcanzado el límite máximo de vehículos permitidos.
              </p>
            )}
          </div>

          {vehiculosForm.map((vehiculo, index) => (
            <div
              key={vehiculo.id || vehiculo.tempId || index}
              className="border rounded-lg p-4 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  Vehículo {index + 1}
                  {vehiculo.isNew && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Nuevo
                    </span>
                  )}
                </h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matrícula */}
                <div>
                  <Label
                    htmlFor={`matricula-${index}`}
                    className="text-sm font-medium"
                  >
                    Matrícula *
                  </Label>
                  <Input
                    id={`matricula-${index}`}
                    type="text"
                    value={vehiculo.matricula}
                    onChange={(e) =>
                      handleInputChange(index, "matricula", e.target.value)
                    }
                    className={`mt-1 ${getErrorForField(index, 'matricula') ? 'border-red-500' : ''}`}
                    placeholder="Ej: ABC123"
                    maxLength={10}
                    required
                    disabled={loading}
                  />
                  {getErrorForField(index, 'matricula') && (
                    <p className="text-red-500 text-xs mt-1">
                      {getErrorForField(index, 'matricula')}
                    </p>
                  )}
                </div>

                {/* Modelo */}
                <div>
                  <Label
                    htmlFor={`modelo-${index}`}
                    className="text-sm font-medium"
                  >
                    Modelo *
                  </Label>
                  <Input
                    id={`modelo-${index}`}
                    type="text"
                    value={vehiculo.modelo}
                    onChange={(e) =>
                      handleInputChange(index, "modelo", e.target.value)
                    }
                    className={`mt-1 ${getErrorForField(index, 'modelo') ? 'border-red-500' : ''}`}
                    placeholder="Ej: Corolla 2020"
                    maxLength={50}
                    required
                    disabled={loading}
                  />
                  {getErrorForField(index, 'modelo') && (
                    <p className="text-red-500 text-xs mt-1">
                      {getErrorForField(index, 'modelo')}
                    </p>
                  )}
                </div>
              </div>

              {/* Información adicional para debugging */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  ID: {vehiculo.id || 'Sin ID'} | 
                  Nuevo: {vehiculo.isNew ? 'Sí' : 'No'} |
                  TempID: {vehiculo.tempId || 'N/A'}
                </div>
              )}
            </div>
          ))}

          {/* Botón para agregar más vehículos - TEMPORALMENTE DESHABILITADO */}
          {/* 
          {vehiculosForm.length < 3 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVehiculo}
              className="w-full"
              disabled={loading || vehiculosForm.length >= 3}
            >
              <Plus className="h-4 w-4 mr-2" />
              {vehiculosForm.length >= 3 
                ? "Máximo de vehículos alcanzado (3/3)" 
                : `Añadir otro vehículo (${vehiculosForm.length}/3)`
              }
            </Button>
          )}
          */}

        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
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
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? "Guardando..." : `Guardar ${hasChanges ? '(Cambios pendientes)' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditVehiculoModal