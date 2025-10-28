/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  CreditCard,
  History,
} from "lucide-react"

// Tipos
interface Banco {
  id: string
  nombre: string
}

interface DatosBancarios {
  cuentaBancaria: string
  titularCuenta: string
  nombreBanco: string
}

interface Retiro {
  id: string
  monto: number
  fecha: string
  estado: "completado" | "pendiente" | "fallido"
  cuentaDestino?: string
}

// Mock del hook - reemplaza con tu hook real
const useWallet = () => {
  return {
    loading: false,
    error: null,
    getBancos: async (): Promise<Banco[]> => [
      { id: "1", nombre: "CaixaBank" },
      { id: "2", nombre: "BBVA" },
      { id: "3", nombre: "Santander" },
    ],
    getDatosBancarios: async (): Promise<DatosBancarios | null> => ({
      cuentaBancaria: "ES91****0051332",
      titularCuenta: "Juan Pérez",
      nombreBanco: "CaixaBank",
    }),
    configurarBanco: async (datos: DatosBancarios) =>
      console.log("Configurar:", datos),
    retirar: async (data: { monto: number }) => console.log("Retirar:", data),
    getHistorialRetiros: async (): Promise<Retiro[]> => [
      {
        id: "1",
        monto: 150,
        fecha: "2025-10-20",
        estado: "completado",
        cuentaDestino: "ES91****0051332",
      },
      {
        id: "2",
        monto: 75,
        fecha: "2025-10-15",
        estado: "completado",
        cuentaDestino: "ES91****0051332",
      },
      {
        id: "3",
        monto: 200,
        fecha: "2025-10-10",
        estado: "pendiente",
        cuentaDestino: "ES91****0051332",
      },
    ],
  }
}

const WalletComponent = () => {
  const {
    loading,
    getBancos,
    getDatosBancarios,
    configurarBanco,
    retirar,
    getHistorialRetiros,
  } = useWallet()
  const [bancos, setBancos] = useState<Banco[]>([])
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(
    null
  )
  const [historial, setHistorial] = useState<Retiro[]>([])
  const [formData, setFormData] = useState<DatosBancarios>({
    cuentaBancaria: "",
    titularCuenta: "",
    nombreBanco: "",
  })
  const [montoRetiro, setMontoRetiro] = useState("")

  const saldoDisponible = 1250.5

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [bancosData, datosData, historialData] = await Promise.all([
      getBancos(),
      getDatosBancarios(),
      getHistorialRetiros(),
    ])
    setBancos(bancosData)
    setDatosBancarios(datosData)
    setHistorial(historialData)
  }

  const handleConfigurar = async () => {
    if (
      !formData.cuentaBancaria ||
      !formData.titularCuenta ||
      !formData.nombreBanco
    ) {
      toast.error("Campos incompletos", {
        description: "Por favor completa todos los campos",
      })
      return
    }

    try {
      toast.loading("Guardando datos bancarios...", { id: "banco" })
      await configurarBanco(formData)
      await cargarDatos()
      toast.success("¡Datos guardados!", {
        id: "banco",
        description: "Tu cuenta bancaria ha sido configurada correctamente",
        duration: 4000,
      })
    } catch (error: any) {
      toast.error("Error al guardar", {
        id: "banco",
        description: error.message || "No se pudieron guardar los datos",
      })
    }
  }

  const handleRetirar = async () => {
    const monto = parseFloat(montoRetiro)

    if (!montoRetiro || isNaN(monto)) {
      toast.error("Monto inválido", {
        description: "Por favor ingresa un monto válido",
      })
      return
    }

    if (monto < 10) {
      toast.error("Monto insuficiente", {
        description: "El monto mínimo de retiro es €10.00",
      })
      return
    }

    if (monto > saldoDisponible) {
      toast.error("Saldo insuficiente", {
        description: `Solo tienes €${saldoDisponible.toFixed(2)} disponible`,
      })
      return
    }

    try {
      toast.loading("Procesando retiro...", { id: "retiro" })
      await retirar({ monto })
      setMontoRetiro("")
      await cargarDatos()
      toast.success("¡Retiro exitoso!", {
        id: "retiro",
        description: `€${monto.toFixed(2)} se procesarán en 1-3 días hábiles`,
        duration: 5000,
      })
    } catch (error: any) {
      toast.error("Error al procesar retiro", {
        id: "retiro",
        description: error.message || "Intenta nuevamente",
      })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <CardDescription className="text-blue-100">
              Saldo Disponible
            </CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Wallet className="w-8 h-8" />€{saldoDisponible.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm">Mínimo de retiro: €10.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total retirado</span>
              <span className="font-semibold">€425.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retiros este mes</span>
              <span className="font-semibold">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="retirar"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="retirar"
            className="gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Retirar
          </TabsTrigger>
          <TabsTrigger
            value="cuenta"
            className="gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Mi Cuenta
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="gap-2"
          >
            <History className="w-4 h-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="retirar"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Retirar Fondos</CardTitle>
              <CardDescription>
                Los fondos llegarán a tu cuenta en 1-3 días hábiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monto">Monto a retirar</Label>
                  <Input className="mt-2"
                    id="monto"
                    type="number"
                    placeholder="50.00"
                    value={montoRetiro}
                    onChange={(e) => setMontoRetiro(e.target.value)}
                    min="10"
                    step="0.01"
                  />
                </div>
                {datosBancarios && (
                  <div className="p-4 bg-muted rounded-lg space-y-1">
                    <p className="text-sm font-medium">Cuenta destino</p>
                    <p className="text-sm text-muted-foreground">
                      {datosBancarios.cuentaBancaria}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {datosBancarios.titularCuenta} -{" "}
                      {datosBancarios.nombreBanco}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleRetirar}
                  disabled={loading || !datosBancarios}
                  className="w-full cursor-pointer"
                >
                  Procesar Retiro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="cuenta"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Configurar Cuenta Bancaria</CardTitle>
              <CardDescription>
                Configura tu IBAN para recibir retiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="ES9121000418450200051332"
                    value={formData.cuentaBancaria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cuentaBancaria: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="titular">Titular de la cuenta</Label>
                  <Input
                    id="titular"
                    placeholder="Juan Pérez"
                    value={formData.titularCuenta}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        titularCuenta: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <Select
                    value={formData.nombreBanco}
                    onValueChange={(value) =>
                      setFormData({ ...formData, nombreBanco: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {bancos.map((banco) => (
                        <SelectItem
                          key={banco.id}
                          value={banco.nombre}
                        >
                          {banco.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleConfigurar}
                  disabled={loading}
                  className="w-full"
                >
                  Guardar Datos Bancarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="historial"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Historial de Retiros</CardTitle>
              <CardDescription>Todos tus retiros realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historial.map((retiro) => (
                  <div
                    key={retiro.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        €{retiro.monto.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {retiro.fecha}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {retiro.cuentaDestino}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          retiro.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : retiro.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {retiro.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WalletComponent
