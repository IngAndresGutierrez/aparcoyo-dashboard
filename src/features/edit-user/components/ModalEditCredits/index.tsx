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
import { creditosService } from "../../services/credits-service"

interface EditCreditosModalProps {
  isOpen: boolean
  onClose: () => void
  creditosActuales: number
  moneda?: string
  userId: string
  onSuccess?: (nuevoCredito: number) => void
}

const EditCreditosModal: React.FC<EditCreditosModalProps> = ({
  isOpen,
  onClose,
  creditosActuales,
  moneda = "€",
  userId,
  onSuccess,
}) => {
  const [creditos, setCreditos] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [successData, setSuccessData] = React.useState<{
    montoAplicado: number
    nuevoBalance: string
  } | null>(null)

  // Inicializar solo cuando se abre el modal - SIN dependencias problemáticas
  React.useEffect(() => {
    if (isOpen) {
      console.log("🔄 Modal abierto, inicializando con:", creditosActuales)
      setCreditos(creditosActuales.toString())
      setError(null)
      setShowSuccess(false)
      setSuccessData(null)
      setLoading(false)
    }
  }, [isOpen]) // Solo depende de isOpen

  // Manejar cambio en el input - SUPER SIMPLE
  const handleCreditosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log("📝 Escribiendo:", value)
    setCreditos(value)
    if (error) setError(null) // Limpiar error directamente
  }

  // Validación simple
  const getValidationError = (value: string): string | null => {
    if (!value || value.trim() === "") return null

    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return "El valor debe ser un número positivo"
    if (num > 9999) return "El valor no puede exceder 9999"
    return null
  }

  const validationError = getValidationError(creditos)

  // Guardar cambios
  const handleSave = async () => {
    if (validationError) return

    const nuevosCreditos = parseFloat(creditos)
    if (nuevosCreditos === creditosActuales) {
      onClose()
      return
    }

    const montoAplicar = nuevosCreditos - creditosActuales
    console.log(
      `💳 Actualizando créditos: ${creditosActuales} → ${nuevosCreditos} (monto: ${montoAplicar})`
    )

    setLoading(true)
    setError(null)

    try {
      const response = await creditosService.editarBalance(userId, montoAplicar)
      console.log(`✅ Créditos actualizados:`, response)

      setSuccessData({
        montoAplicado: response.data.monto,
        nuevoBalance: response.data.nuevoBalance,
      })

      setShowSuccess(true)

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(parseFloat(response.data.nuevoBalance))
        }
        onClose()
      }, 2000)
    } catch (err) {
      console.error("❌ Error al actualizar créditos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !validationError) {
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

        {showSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Créditos actualizados!
            </h3>
            <p className="text-sm text-green-600 mb-2">
              Los nuevos créditos se han guardado correctamente
            </p>
            {successData && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  Monto aplicado: {successData.montoAplicado > 0 ? "+" : ""}
                  {successData.montoAplicado} {moneda}
                </p>
                <p>
                  Nuevo balance: {successData.nuevoBalance} {moneda}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
                    type="number"
                    step="0.01"
                    min="0"
                    max="9999"
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

                {!error && validationError && (
                  <p className="text-red-500 text-xs mt-1">{validationError}</p>
                )}

                {!error &&
                  !validationError &&
                  creditos &&
                  creditos !== creditosActuales.toString() && (
                    <div className="text-muted-foreground text-xs mt-1 space-y-1">
                      <p>
                        Cambio: {creditosActuales} → {creditos} {moneda}
                      </p>
                      <p>
                        Monto a aplicar:{" "}
                        {parseFloat(creditos) - creditosActuales > 0 ? "+" : ""}
                        {parseFloat(creditos) - creditosActuales} {moneda}
                      </p>
                    </div>
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
              disabled={
                loading ||
                !!error ||
                !!validationError ||
                creditos === creditosActuales.toString()
              }
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
