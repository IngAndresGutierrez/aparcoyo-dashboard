"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

// ✅ IMPORTAR el hook real y los tipos
import { useWallet } from "../../hooks/useWallet"
import { DatosBancarios, Retiro, Banco, Saldo } from "../../types/wallet"

const WalletComponent = () => {
  const {
    loading,
    getBancos,
    getDatosBancarios,
    configurarBanco,
    retirar,
    getHistorialRetiros,
    getSaldo,
    getComisionesPendientes,
  } = useWallet()
  const [bancos, setBancos] = useState<Banco[]>([])
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(
    null
  )
  const [historial, setHistorial] = useState<Retiro[]>([])
  const [saldo, setSaldo] = useState<Saldo>({
    saldoTotal: 0,
    saldoGanado: 0,
    saldoRecargado: 0,
    puedeRetirar: false,
    montoMinimoRetiro: 5,
  })
  const [formData, setFormData] = useState<DatosBancarios>({
    cuentaBancaria: "",
    titularCuenta: "",
    nombreBanco: "",
  })
  const [montoRetiro, setMontoRetiro] = useState("")

  // ✅ NUEVO: Estado para validación del IBAN
  const [ibanError, setIbanError] = useState<string>("")
  const [ibanValido, setIbanValido] = useState<boolean>(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [bancosData, datosData, historialData, saldoData, comisionesData] =
      await Promise.all([
        getBancos(),
        getDatosBancarios(),
        getHistorialRetiros(),
        getSaldo(),
        getComisionesPendientes(),
      ])

    console.log("📊 Datos cargados:")
    console.log("  - Bancos:", bancosData?.length)
    console.log("  - Datos bancarios:", datosData)
    console.log("  - Historial:", historialData?.length)
    console.log("  - Saldo:", saldoData)
    console.log("  - Comisiones pendientes:", comisionesData)

    setBancos(bancosData)
    setDatosBancarios(datosData)
    setHistorial(historialData)

    const saldoDisponible =
      (saldoData?.saldoGanado || 0) - (comisionesData?.totalPendiente || 0)

    console.log("💰 CÁLCULO SALDO:")
    console.log("  - Saldo ganado:", saldoData?.saldoGanado)
    console.log("  - Comisiones pendientes:", comisionesData?.totalPendiente)
    console.log("  - Saldo disponible:", saldoDisponible)

    setSaldo({
      saldoTotal: saldoData?.saldoTotal || 0,
      saldoGanado: saldoDisponible,
      saldoRecargado: saldoData?.saldoRecargado || 0,
      puedeRetirar: saldoData?.puedeRetirar || false,
      montoMinimoRetiro: saldoData?.montoMinimoRetiro || 10,
    })
  }

  // ✅ NUEVA FUNCIÓN: Validar IBAN en tiempo real
  const validarIBAN = (iban: string): void => {
    if (!iban) {
      setIbanError("")
      setIbanValido(false)
      return
    }

    const ibanLimpio = iban.replace(/\s/g, "").toUpperCase()

    // Validar formato español
    if (!ibanLimpio.startsWith("ES")) {
      setIbanError("El IBAN debe comenzar con ES")
      setIbanValido(false)
      return
    }

    if (ibanLimpio.length > 24) {
      setIbanError("IBAN demasiado largo (máximo 24 caracteres)")
      setIbanValido(false)
      return
    }

    if (ibanLimpio.length < 24 && ibanLimpio.length > 2) {
      setIbanError(`Faltan ${24 - ibanLimpio.length} caracteres`)
      setIbanValido(false)
      return
    }

    const ibanRegex = /^ES\d{22}$/
    if (!ibanRegex.test(ibanLimpio)) {
      if (ibanLimpio.length === 24) {
        setIbanError("Formato inválido. Debe ser: ES + 22 dígitos")
      }
      setIbanValido(false)
      return
    }

    // ✅ IBAN válido
    setIbanError("")
    setIbanValido(true)
  }

  // ✅ MEJORADO: Manejar cambio de IBAN con validación
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setFormData({
      ...formData,
      cuentaBancaria: valor,
    })
    validarIBAN(valor)
  }

  // ✅ FUNCIÓN: Formatear IBAN para mostrar (con espacios cada 4 caracteres)
  const formatearIBAN = (iban: string | null | undefined): string => {
    if (!iban || typeof iban !== "string") {
      return "N/A"
    }
    const ibanLimpio = iban.replace(/\s/g, "")
    return ibanLimpio.match(/.{1,4}/g)?.join(" ") || ibanLimpio
  }

  const calcularTotalRetirado = (retiros: Retiro[]): number => {
    if (!retiros || !Array.isArray(retiros)) {
      return 0
    }
    return retiros
      .filter((r) => r.estado === "completado")
      .reduce((sum, r) => sum + r.monto, 0)
  }

  const calcularRetirosEsteMes = (retiros: Retiro[]): number => {
    if (!retiros || !Array.isArray(retiros)) {
      return 0
    }
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const añoActual = ahora.getFullYear()

    return retiros.filter((retiro) => {
      const fechaRetiro = new Date(retiro.fecha)
      return (
        fechaRetiro.getMonth() === mesActual &&
        fechaRetiro.getFullYear() === añoActual
      )
    }).length
  }

  const totalRetirado = calcularTotalRetirado(historial)
  const retirosEsteMes = calcularRetirosEsteMes(historial)

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

    // ✅ Validar que el IBAN sea válido
    if (!ibanValido) {
      toast.error("IBAN inválido", {
        description: ibanError || "Verifica el formato del IBAN",
      })
      return
    }

    try {
      toast.loading("Guardando datos bancarios...", { id: "banco" })

      // El servicio wallet-service.ts ya limpia el IBAN automáticamente
      await configurarBanco(formData)
      await cargarDatos()

      toast.success("¡Datos guardados!", {
        id: "banco",
        description: "Tu cuenta bancaria ha sido configurada correctamente",
        duration: 4000,
      })

      // ✅ Limpiar formulario después de guardar
      setFormData({
        cuentaBancaria: "",
        titularCuenta: "",
        nombreBanco: "",
      })
      setIbanError("")
      setIbanValido(false)
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

    if (monto < saldo.montoMinimoRetiro) {
      toast.error("Monto insuficiente", {
        description: `El monto mínimo de retiro es €${saldo.montoMinimoRetiro.toFixed(
          2
        )}`,
      })
      return
    }

    if (monto > saldo.saldoGanado) {
      toast.error("Saldo insuficiente", {
        description: `Solo puedes retirar €${saldo.saldoGanado.toFixed(
          2
        )} (saldo ganado)`,
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
              Saldo Disponible para Retiro
            </CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Wallet className="w-8 h-8" />€{saldo.saldoGanado.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-blue-100 text-sm">
              Mínimo de retiro: €{saldo.montoMinimoRetiro.toFixed(2)}
            </p>
            {saldo.saldoRecargado > 0 && (
              <p className="text-blue-200 text-xs">
                💡 Saldo recargado: €{saldo.saldoRecargado.toFixed(2)} (no
                retirable)
              </p>
            )}
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
              <span className="font-semibold">€{totalRetirado.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retiros este mes</span>
              <span className="font-semibold">{retirosEsteMes}</span>
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
                  <Input
                    className="mt-2"
                    id="monto"
                    type="number"
                    placeholder="50.00"
                    value={montoRetiro}
                    onChange={(e) => setMontoRetiro(e.target.value)}
                    min={saldo.montoMinimoRetiro}
                    step="0.01"
                    max={saldo.saldoGanado}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: €{saldo.saldoGanado.toFixed(2)}
                  </p>
                </div>
                {datosBancarios && (
                  <div className="p-4 bg-muted rounded-lg space-y-1">
                    <p className="text-sm font-medium">Cuenta destino</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {formatearIBAN(datosBancarios.cuentaBancaria)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {datosBancarios.titularCuenta} -{" "}
                      {datosBancarios.nombreBanco}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleRetirar}
                  disabled={
                    loading ||
                    !datosBancarios ||
                    saldo.saldoGanado < saldo.montoMinimoRetiro
                  }
                  className="w-full cursor-pointer"
                >
                  {saldo.saldoGanado < saldo.montoMinimoRetiro
                    ? `Saldo insuficiente (mínimo €${saldo.montoMinimoRetiro})`
                    : "Procesar Retiro"}
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
                {/* ✅ INPUT DE IBAN CON VALIDACIÓN VISUAL */}
                <div>
                  <Label htmlFor="iban">IBAN español</Label>
                  <div className="relative mt-2">
                    <Input
                      id="iban"
                      placeholder="ES91 2100 0418 4502 0005 1332"
                      value={formData.cuentaBancaria}
                      onChange={handleIbanChange}
                      className={`pr-10 ${
                        formData.cuentaBancaria && ibanError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : formData.cuentaBancaria && ibanValido
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                    />
                    {/* Icono de validación */}
                    {formData.cuentaBancaria && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {ibanValido ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {/* Mensaje de error/ayuda */}
                  {ibanError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {ibanError}
                    </p>
                  )}
                  {ibanValido && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      IBAN válido
                    </p>
                  )}
                  {!formData.cuentaBancaria && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Formato: ES + 22 dígitos (24 caracteres en total)
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="titular">Titular de la cuenta</Label>
                  <Input
                    className="mt-2"
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
                  <Label
                    className="pb-2"
                    htmlFor="banco"
                  >
                    Banco
                  </Label>
                  <Select
                    value={formData.nombreBanco}
                    onValueChange={(value) =>
                      setFormData({ ...formData, nombreBanco: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          bancos.length === 0
                            ? "Cargando bancos..."
                            : "Selecciona tu banco"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {bancos.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">
                          Cargando bancos...
                        </div>
                      ) : (
                        bancos.map((banco) => (
                          <SelectItem
                            key={banco.codigo}
                            value={banco.nombre}
                          >
                            {banco.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleConfigurar}
                  disabled={loading || !ibanValido}
                  className="w-full cursor-pointer"
                >
                  {!ibanValido && formData.cuentaBancaria
                    ? "Verifica el IBAN"
                    : "Guardar Datos Bancarios"}
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
                {!historial ||
                !Array.isArray(historial) ||
                historial.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay retiros registrados
                  </p>
                ) : (
                  historial.map((retiro) => (
                    <div
                      key={retiro.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">
                          €{retiro.monto.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(retiro.fecha).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {retiro.cuentaDestino && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatearIBAN(retiro.cuentaDestino)}
                          </p>
                        )}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WalletComponent
