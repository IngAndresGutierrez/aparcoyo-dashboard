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
import { CreditCard, CheckCircle } from "lucide-react"

interface EditCreditosModalProps {
  isOpen: boolean
  onClose: () => void
  creditosActuales: number
  moneda?: string
  userId?: string // Para modo admin
  onSuccess?: (nuevoCredito: number) => void
}

const EditCreditosModal: React.FC<EditCreditosModalProps> = ({
  isOpen,
  onClose,
  creditosActuales,
  moneda = "€",

  onSuccess,
}) => {
  const [creditos, setCreditos] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showSuccess, setShowSuccess] = React.useState(false)

  // Inicializar el valor cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setCreditos(creditosActuales.toString())
      setError(null)
      setShowSuccess(false)
    }
  }, [isOpen, creditosActuales])

  // Manejar cambio en el input
  const handleCreditosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Solo permitir números y decimales
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCreditos(value)
      setError(null)
    }
  }

  // Validar el valor
  const validateCreditos = (value: string): boolean => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      setError("El valor debe ser un número positivo")
      return false
    }
    if (num > 9999) {
      setError("El valor no puede exceder 9999")
      return false
    }
    return true
  }

  // Guardar cambios (SIMULADO CON DATOS MOCK)
  const handleSave = async () => {
    if (!validateCreditos(creditos)) {
      return
    }

    const nuevosCreditos = parseFloat(creditos)

    // Si no hay cambios, cerrar modal
    if (nuevosCreditos === creditosActuales) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(
        `💳 [MOCK] Actualizando créditos: ${creditosActuales} → ${nuevosCreditos}`
      )

      // 🎭 SIMULACIÓN: Esperar 1.5 segundos para simular petición al servidor
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 🎭 SIMULACIÓN: 90% probabilidad de éxito
      const success = Math.random() > 0.1

      if (!success) {
        throw new Error(
          "Error de conexión simulado (esto es solo para demostración)"
        )
      }

      console.log(`✅ [MOCK] Créditos actualizados exitosamente`)

      // Mostrar mensaje de éxito
      setShowSuccess(true)

      // Esperar un poco antes de cerrar
      setTimeout(() => {
        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess(nuevosCreditos)
        }
        onClose()
      }, 1500)
    } catch (err) {
      console.error("❌ [MOCK] Error simulado:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Error simulado al actualizar créditos"
      )
    } finally {
      // Solo quitar loading si no fue exitoso (para mostrar el mensaje de éxito)
      if (!showSuccess) {
        setLoading(false)
      }
    }
  }

  // Manejar Enter en el input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSave()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <span>Editar Créditos</span>
          </DialogTitle>
        </DialogHeader>

        {/* Mostrar mensaje de éxito */}
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Créditos actualizados!
            </h3>
            <p className="text-sm text-green-600">
              Los nuevos créditos se han guardado correctamente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Banner informativo para demo */}

            <div>
              <h3 className="font-semibold text-lg mb-4">
                Créditos disponibles
              </h3>

              <div>
                <Label
                  htmlFor="creditos"
                  className="text-sm font-medium"
                >
                  Créditos
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                    {moneda}
                  </span>
                  <Input
                    id="creditos"
                    type="text"
                    value={creditos}
                    onChange={handleCreditosChange}
                    onKeyPress={handleKeyPress}
                    className="pl-8"
                    placeholder="0"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

                {!error &&
                  creditos &&
                  creditos !== creditosActuales.toString() && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Cambio: {creditosActuales} → {creditos} {moneda}
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {showSuccess ? "Cerrar" : "Cancelar"}
          </Button>

          {!showSuccess && (
            <Button
              onClick={handleSave}
              disabled={loading || !!error}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditCreditosModal
