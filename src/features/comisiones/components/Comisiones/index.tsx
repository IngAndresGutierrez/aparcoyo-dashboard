"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Percent,
  Wallet,
  TrendingUp,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useComisiones } from "../../hooks/useComisiones"
import { ConfiguracionComisiones } from "../../types/comisiones"

export default function ComisionesPage() {
  const {
    configuracion,
    isLoading,
    error,
    obtenerConfiguracion,
    actualizarConfiguracion,
  } = useComisiones()
  const [formData, setFormData] = useState<ConfiguracionComisiones>({
    stripePorcentaje: 0,
    stripeFijoEuros: 0,
    comisionAdminPorcentaje: 0,
    minimoRetiroEuros: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    obtenerConfiguracion()
  }, [obtenerConfiguracion])

  useEffect(() => {
    if (configuracion) {
      setFormData(configuracion)
    }
  }, [configuracion])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseFloat(value)
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setShowSuccess(false)

    try {
      console.log("📤 Enviando datos:", formData)
      const resultado = await actualizarConfiguracion(formData)
      console.log("✅ Respuesta del servidor:", resultado)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error("❌ Error al guardar:", err)
      alert(
        `Error: ${err instanceof Error ? err.message : "Error desconocido"}`
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !configuracion) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="m-6"
      >
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="pb-1 text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Configuración de Comisiones
          </h1>
          <p className="text-muted-foreground">
            Gestiona los porcentajes y tarifas de las transacciones de la
            plataforma
          </p>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              ¡Configuración actualizada exitosamente!
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario Principal */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                Configuración de la Plataforma
              </CardTitle>
              <CardDescription>
                Define las comisiones administrativas y límites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="comisionAdminPorcentaje"
                    className="flex items-center gap-2"
                  >
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    Comisión Admin (%)
                  </Label>
                  <Input
                    id="comisionAdminPorcentaje"
                    name="comisionAdminPorcentaje"
                    type="number"
                    step="1"
                    value={formData.comisionAdminPorcentaje}
                    onChange={handleInputChange}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Porcentaje sobre el subtotal
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="minimoRetiroEuros"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    Retiro Mínimo (€)
                  </Label>
                  <Input
                    id="minimoRetiroEuros"
                    name="minimoRetiroEuros"
                    type="number"
                    step="1"
                    value={formData.minimoRetiroEuros}
                    onChange={handleInputChange}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Monto mínimo para retirar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
 