/* eslint-disable @typescript-eslint/no-explicit-any */
// features/edit-plazas/components/ModalDetallesPlaza.tsx
"use client"

import { useState, useEffect } from "react"
import { Edit3, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // ✅ Importar toast de Sonner

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ✅ Interfaces para tipado
interface Propietario {
  id: string
  nombre: string
  email: string
}

interface PlazaData {
  id: string
  nombre: string
  descripcion: string
  precio: string | number
  propietario: {
    uid: string
    nombre: string
    email?: string
  }
}

interface FormData {
  nombre: string
  descripcion: string
  precio: number
  propietario: {
    id: string
    nombre: string
    email: string
  }
}

// ✅ Props del modal
interface ModalDetallesPlazaProps {
  isOpen: boolean
  onClose: () => void

  // Datos que vienen del padre
  plazaData: PlazaData | null
  loading: boolean
  saving: boolean
  error: string | null
  propietarios: Propietario[]

  // Funciones que ejecuta el padre
  onSave: (formData: FormData) => Promise<void>
  onRetry: () => void
  onClearError: () => void
}

// ✅ Modal principal
function ModalDetallesPlaza({
  isOpen,
  onClose,
  plazaData,
  loading,
  saving,
  error,
  propietarios,
  onSave,
  onRetry,
  onClearError,
}: ModalDetallesPlazaProps) {
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    precio: 0,
    propietario: {
      id: "",
      nombre: "",
      email: "",
    },
  })

  // Estado para errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({})

  // 🛠️ COMPONENTE PARA MOSTRAR PROPIETARIO - CORREGIDO PARA MANEJAR DESAJUSTE DE IDs
  const PropietarioDisplay = () => {
    // Buscar por ID normal primero
    let propietarioActual = propietarios.find(
      (p) => p.id === formData.propietario.id
    )

    // Si no se encuentra por ID, buscar por email como fallback
    if (!propietarioActual && formData.propietario.email) {
      propietarioActual = propietarios.find(
        (p) =>
          p.email.toLowerCase() === formData.propietario.email.toLowerCase()
      )
    }

    // Determinar qué mostrar - priorizar datos encontrados, luego formData
    const nombreAMostrar =
      propietarioActual?.nombre || formData.propietario.nombre || "Sin nombre"
    const emailAMostrar =
      propietarioActual?.email || formData.propietario.email || ""

    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {nombreAMostrar}
          </span>
          <span className="text-sm text-gray-500">{emailAMostrar}</span>
        </div>
      </div>
    )
  }

  // Limpiar errores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setErrores({})
      if (onClearError) {
        onClearError()
      }
    }
  }, [isOpen, onClearError])

  // 🛠️ ACTUALIZAR FORMULARIO - MEJORADO PARA PRESERVAR DATOS
  useEffect(() => {
    console.log("🔍 MODAL - plazaData cambió:", plazaData)
    console.log("🔍 MODAL - propietario en plazaData:", plazaData?.propietario)

    if (plazaData) {
      // 🛠️ BUSCAR PROPIETARIO EN LA LISTA PARA OBTENER DATOS COMPLETOS
      let propietarioCompleto = propietarios.find(
        (p) => p.id === plazaData.propietario.uid
      )

      // Si no se encuentra por UID, buscar por email
      if (!propietarioCompleto && plazaData.propietario.email) {
        propietarioCompleto = propietarios.find(
          (p) =>
            p.email.toLowerCase() === plazaData.propietario.email?.toLowerCase()
        )
      }

      console.log(
        "🔍 MODAL - propietarioCompleto encontrado:",
        propietarioCompleto
      )

      const nuevosFormData = {
        nombre: plazaData.nombre,
        descripcion: plazaData.descripcion || "",
        precio:
          typeof plazaData.precio === "string"
            ? parseFloat(plazaData.precio) || 0
            : plazaData.precio || 0,
        propietario: {
          id: plazaData.propietario.uid,
          // 🛠️ USAR DATOS COMPLETOS SI SE ENCUENTRAN, SINO USAR LOS DE plazaData
          nombre:
            propietarioCompleto?.nombre ||
            plazaData.propietario.nombre ||
            "Sin nombre",
          email:
            propietarioCompleto?.email || plazaData.propietario.email || "",
        },
      }

      console.log("🔍 MODAL - Actualizando formData a:", nuevosFormData)
      console.log(
        "🔍 MODAL - Propietario en formData:",
        nuevosFormData.propietario
      )

      setFormData(nuevosFormData)
    }
  }, [plazaData, propietarios]) // ← Agregar propietarios como dependencia

  // Función para manejar cambios en los inputs
  const handleChange = (campo: string, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }))

    // Limpiar error del campo modificado
    if (errores[campo]) {
      setErrores((prev) => ({
        ...prev,
        [campo]: "",
      }))
    }
  }

  // 🛠️ FUNCIÓN MEJORADA PARA MANEJAR CAMBIO DE PROPIETARIO
  const handlePropietarioChange = (propietarioId: string) => {
    console.log("🔍 MODAL - Cambiando propietario a ID:", propietarioId)

    const propietarioSeleccionado = propietarios.find(
      (p) => p.id === propietarioId
    )

    console.log("🔍 MODAL - Propietario encontrado:", propietarioSeleccionado)

    if (propietarioSeleccionado) {
      const nuevoFormData = {
        ...formData,
        propietario: {
          id: propietarioSeleccionado.id,
          nombre: propietarioSeleccionado.nombre,
          email: propietarioSeleccionado.email,
        },
      }

      console.log(
        "🔍 MODAL - Actualizando formData.propietario a:",
        nuevoFormData.propietario
      )

      setFormData(nuevoFormData)

      // Limpiar error si existía
      if (errores.propietario) {
        setErrores((prev) => ({ ...prev, propietario: "" }))
      }
    } else {
      console.warn(
        "⚠️ MODAL - No se encontró propietario con ID:",
        propietarioId
      )
    }
  }

  // Función de validación
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido"
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es requerida"
    }

    if (formData.precio <= 0) {
      nuevosErrores.precio = "El precio debe ser mayor a 0"
    }

    if (!formData.propietario.id) {
      nuevosErrores.propietario = "Debe seleccionar un propietario"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // 🛠️ FUNCIÓN MEJORADA PARA MANEJAR GUARDAR CON TOAST
  const handleGuardar = async () => {
    if (!validarFormulario()) return

    try {
      console.log("🔍 MODAL - Guardando con formData:", formData)
      console.log(
        "🔍 MODAL - Propietario antes de guardar:",
        formData.propietario
      )

      // ✅ Llamar función del padre
      await onSave(formData)

      console.log("✅ MODAL - Guardado exitoso")

      // ✅ MOSTRAR TOAST DE ÉXITO
      toast.success("Plaza actualizada", {
        description: "Los cambios se han guardado correctamente",
        duration: 3000,
      })

      // El modal se cierra automáticamente
      onClose()
    } catch (error) {
      console.error("❌ MODAL - Error en el modal:", error)

      // ✅ MOSTRAR TOAST DE ERROR
      toast.error("Error al guardar", {
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        duration: 4000,
      })
    }
  }

  // Función para manejar cancelar
  const handleCancelar = () => {
    // Resetear formulario a datos originales
    if (plazaData) {
      // Buscar propietario completo para el reseteo
      let propietarioCompleto = propietarios.find(
        (p) => p.id === plazaData.propietario.uid
      )

      if (!propietarioCompleto && plazaData.propietario.email) {
        propietarioCompleto = propietarios.find(
          (p) =>
            p.email.toLowerCase() === plazaData.propietario.email?.toLowerCase()
        )
      }

      setFormData({
        nombre: plazaData.nombre,
        descripcion: plazaData.descripcion || "",
        precio:
          typeof plazaData.precio === "string"
            ? parseFloat(plazaData.precio) || 0
            : plazaData.precio || 0,
        propietario: {
          id: plazaData.propietario.uid,
          nombre:
            propietarioCompleto?.nombre ||
            plazaData.propietario.nombre ||
            "Sin nombre",
          email:
            propietarioCompleto?.email || plazaData.propietario.email || "",
        },
      })
    }
    setErrores({})
    if (onClearError) {
      onClearError()
    }
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // ✅ SOLO PERMITIR CERRAR, NO ABRIR DESDE AQUÍ
        if (!open) {
          handleCancelar()
        }
      }}
    >
      <DialogContent className="max-w-[450px] p-0 gap-0 bg-white rounded-xl shadow-2xl">
        {/* Estado de loading */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Cargando datos de la plaza...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Error al cargar la plaza</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
              >
                Reintentar
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {/* Formulario cuando hay datos */}
        {plazaData && !loading && (
          <>
            {/* Header del modal */}
            <DialogHeader className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Detalles de la plaza
                  </DialogTitle>
                </div>
                {/* ✅ REMOVED: El botón X manual ya no es necesario */}
              </div>
            </DialogHeader>

            {/* Contenido del modal */}
            <div className="px-6 py-6 space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label
                  htmlFor="nombre"
                  className="text-sm font-medium text-gray-700"
                >
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className={`h-11 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errores.nombre ? "border-red-300" : ""
                  }`}
                  disabled={saving}
                />
                {errores.nombre && (
                  <p className="text-xs text-red-600">{errores.nombre}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label
                  htmlFor="descripcion"
                  className="text-sm font-medium text-gray-700"
                >
                  Descripción{" "}
                  <span className="text-gray-400 font-normal">(Opcional)</span>
                </Label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-md resize-none text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 leading-relaxed ${
                    errores.descripcion ? "border-red-300" : ""
                  }`}
                  disabled={saving}
                />
                {errores.descripcion && (
                  <p className="text-xs text-red-600">{errores.descripcion}</p>
                )}
              </div>

              {/* 🛠️ PROPIETARIO CORREGIDO PARA MANEJAR DESAJUSTE DE IDs */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Propietario
                </Label>
                <Select
                  value={formData.propietario.id}
                  onValueChange={handlePropietarioChange}
                  disabled={saving}
                >
                  <SelectTrigger
                    className={`h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                      errores.propietario ? "border-red-300" : ""
                    }`}
                  >
                    <SelectValue>
                      {formData.propietario.id ? (
                        <PropietarioDisplay />
                      ) : (
                        <span className="text-gray-500">
                          Seleccionar propietario
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {propietarios.map((propietario) => (
                      <SelectItem
                        key={propietario.id}
                        value={propietario.id}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {propietario.nombre}
                            </span>
                            <span className="text-xs text-gray-500">
                              {propietario.email}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.propietario && (
                  <p className="text-xs text-red-600">{errores.propietario}</p>
                )}
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label
                  htmlFor="precio"
                  className="text-sm font-medium text-gray-700"
                >
                  Precio
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    €
                  </span>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) =>
                      handleChange("precio", parseFloat(e.target.value) || 0)
                    }
                    className={`h-11 pl-8 text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                      errores.precio ? "border-red-300" : ""
                    }`}
                    min="0"
                    step="0.01"
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Este precio está definido por días.
                </p>
                {errores.precio && (
                  <p className="text-xs text-red-600">{errores.precio}</p>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ModalDetallesPlaza
