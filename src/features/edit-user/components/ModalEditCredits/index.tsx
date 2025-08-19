"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"

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
  userId,
  onSuccess
}) => {
  const [creditos, setCreditos] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Inicializar el valor cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setCreditos(creditosActuales.toString())
      setError(null)
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

  // Guardar cambios
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
      const token = localStorage.getItem("token") || localStorage.getItem("authToken")
      
      // Decidir qué endpoint usar
      let url = `https://aparcoyo-back.onrender.com/apa/usuarios/creditos`
      let body = { creditos: nuevosCreditos }
      
      if (userId) {
        // Modo admin - actualizar créditos de usuario específico
        url = `https://aparcoyo-back.onrender.com/apa/usuarios/${userId}/creditos`
        body = { creditos: nuevosCreditos }
      }

      console.log(`💳 Actualizando créditos: ${creditosActuales} → ${nuevosCreditos}`)
      console.log(`📡 URL: ${url}`)

      const response = await fetch(url, {
        method: 'PUT', // o 'PATCH' según tu API
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      console.log(`📨 Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Créditos actualizados:`, data)

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(nuevosCreditos)
      }

      onClose()
    } catch (err) {
      console.error("❌ Error al actualizar créditos:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar créditos")
    } finally {
      setLoading(false)
    }
  }

  // Manejar Enter en el input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <span>Editar Créditos</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-4">Créditos disponibles</h3>
            
            <div>
              <Label htmlFor="creditos" className="text-sm font-medium">
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
              
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
              
              {!error && creditos && creditos !== creditosActuales.toString() && (
                <p className="text-muted-foreground text-xs mt-1">
                  Cambio: {creditosActuales} → {creditos} {moneda}
                </p>
              )}
            </div>
          </div>
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
            disabled={loading || !!error}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditCreditosModal