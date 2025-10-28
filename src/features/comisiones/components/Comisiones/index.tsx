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
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Percent,
  DollarSign,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [montoSimulador, setMontoSimulador] = useState(100)

  // Cargar configuración al montar el componente
  useEffect(() => {
    obtenerConfiguracion()
  }, [obtenerConfiguracion])

  // Actualizar formData cuando cambie la configuración
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

  // Calcular ejemplo de comisión
  const calcularEjemplo = (monto = 100) => {
    const stripePorcentaje = Number(formData.stripePorcentaje) || 0
    const stripeFijo = Number(formData.stripeFijoEuros) || 0
    const adminPorcentaje = Number(formData.comisionAdminPorcentaje) || 0

    const comisionStripe = monto * stripePorcentaje + stripeFijo
    const subtotal = monto - comisionStripe
    const comisionAdmin = subtotal * (adminPorcentaje / 100)
    const neto = subtotal - comisionAdmin

    return {
      comisionStripe: isNaN(comisionStripe) ? 0 : comisionStripe,
      comisionAdmin: isNaN(comisionAdmin) ? 0 : comisionAdmin,
      neto: isNaN(neto) ? 0 : neto,
      total: monto,
    }
  }

  const ejemplo = calcularEjemplo(montoSimulador)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario Principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Comisiones de Stripe
                  </CardTitle>
                  <CardDescription>
                    Configura las tarifas de procesamiento de pagos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="stripePorcentaje"
                        className="flex items-center gap-2"
                      >
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        Porcentaje (%)
                      </Label>
                      <Input
                        id="stripePorcentaje"
                        name="stripePorcentaje"
                        type="number"
                        step="0.001"
                        value={formData.stripePorcentaje}
                        onChange={handleInputChange}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ej: 0.014 = 1.4%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="stripeFijoEuros"
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Tarifa Fija (€)
                      </Label>
                      <Input
                        id="stripeFijoEuros"
                        name="stripeFijoEuros"
                        type="number"
                        step="0.01"
                        value={formData.stripeFijoEuros}
                        onChange={handleInputChange}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tarifa por transacción
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className=" cursor-pointer w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
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
            </div>

            {/* Panel de Vista Previa */}
            <div className="space-y-6">
              <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">
                    💰 Simulador de Comisiones
                  </CardTitle>
                  <CardDescription>Ejemplo con €100.00</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Monto inicial
                      </span>
                      <span className="font-mono font-semibold">
                        €{ejemplo.total.toFixed(2)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                      <span className="text-sm">Comisión Stripe</span>
                      <span className="font-mono">
                        -€{ejemplo.comisionStripe.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                      <span className="text-sm">Comisión Admin</span>
                      <span className="font-mono">
                        -€{ejemplo.comisionAdmin.toFixed(2)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold text-green-600 dark:text-green-400">
                      <span>Neto a recibir</span>
                      <span className="font-mono">
                        €{ejemplo.neto.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (ejemplo.neto / ejemplo.total) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {((ejemplo.neto / ejemplo.total) * 100).toFixed(1)}% neto
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📋 Resumen Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe %</span>
                    <span className="font-mono">
                      {((Number(formData.stripePorcentaje) || 0) * 100).toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe fijo</span>
                    <span className="font-mono">
                      €{(Number(formData.stripeFijoEuros) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin %</span>
                    <span className="font-mono">
                      {Number(formData.comisionAdminPorcentaje) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retiro mínimo</span>
                    <span className="font-mono">
                      €{(Number(formData.minimoRetiroEuros) || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
