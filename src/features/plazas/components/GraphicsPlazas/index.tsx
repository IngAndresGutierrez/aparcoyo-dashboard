/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

import { usePlazasStats } from "../../hooks/useGetRangePlazas"
import { GrowthData, PlazasChartDataPoint } from "../../types/range"

export const description = "An area chart showing plaza types over time"

// Configuración corregida para datos reales
const chartConfig = {
  inmediatas: {
    label: "Plazas Inmediatas",
    color: "#0E47E1", // azul
  },
  privadas: {
    label: "Plazas Privadas",
    color: "#9A75E5", // morado
  },
} satisfies ChartConfig

interface TotalUsersGraphPlazasProps {
  rango?: "dia" | "semana" | "mes"
}

// Función transformada para usar datos reales de plazas
const transformDataForChart = (
  plazasDetalle: any[],
  rango: "dia" | "semana" | "mes"
): PlazasChartDataPoint[] => {
  if (!plazasDetalle || !Array.isArray(plazasDetalle)) {
    return []
  }

  console.log("🔍 Estructura de PlazaDetalle:", plazasDetalle[0])

  // Agrupar por período basado en el rango seleccionado
  const groupedByPeriod = plazasDetalle.reduce((acc, plaza) => {
    console.log("=== DIAGNÓSTICO COMPLETO ===")
    console.log("🔍 Rango seleccionado:", rango)
    console.log("🔍 Total de plazas:", plazasDetalle.length)

    const dateField = plaza.fechaPublicacion // Usar fechaPublicacion específicamente

    if (!dateField) {
      console.warn("⚠️ No se encontró fechaPublicacion en:", plaza)
      return acc
    }

    const date = new Date(dateField)
    let periodKey: string

    // Generar clave del período según el rango
    switch (rango) {
      case "dia":
        periodKey = date.toISOString().split("T")[0] // YYYY-MM-DD
        break
      case "semana":
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        periodKey = startOfWeek.toISOString().split("T")[0]
        break
      case "mes":
      default:
        periodKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}` // YYYY-MM
        console.log("DEBUG MES:", {
          fechaOriginal: dateField,
          dateObject: date,
          año: date.getFullYear(),
          mesNumber: date.getMonth() + 1,
          periodKey: periodKey,
        })
        break
    }

    if (!acc[periodKey]) {
      acc[periodKey] = {
        inmediatas: 0,
        privadas: 0,
        date,
        period: periodKey,
      }
    }

    // Contar por tipo según los datos reales
    if (plaza.tipo === "Inmediata") {
      acc[periodKey].inmediatas++
    } else if (plaza.tipo === "Privada") {
      acc[periodKey].privadas++
    }

    return acc
  }, {} as Record<string, { inmediatas: number; privadas: number; date: Date; period: string }>)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

  // Convertir a formato del gráfico
  return Object.entries(groupedByPeriod)
    .sort(([a], [b]) => a.localeCompare(b)) // Ordenar por período
    .map(([key, data]) => {
      const typedData = data as {
        inmediatas: number
        privadas: number
        date: Date
        period: string
      }
      let displayName: string

      switch (rango) {
        case "dia":
          displayName = `${
            dayNames[typedData.date.getDay()]
          } ${typedData.date.getDate()}`
          break
        case "semana":
          displayName = `S${Math.ceil(typedData.date.getDate() / 7)}`
          break
        case "mes":
        default:
          displayName =
            monthNames[typedData.date.getMonth()]?.slice(0, 3) || key
          break
      }

      return {
        month: displayName,
        inmediatas: typedData.inmediatas,
        privadas: typedData.privadas,
        date: key,
        fullMonth: typedData.date.toLocaleDateString("es-ES", {
          ...(rango === "dia" && {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
          ...(rango === "semana" && {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          ...(rango === "mes" && { month: "long", year: "numeric" }),
        }),
      }
    })
}

// Función para calcular total de plazas
const calculateTotalPlazas = (plazasDetalle: any[]): number => {
  return plazasDetalle?.length || 0
}

// Función para calcular porcentaje de crecimiento
const calculateGrowthPercentage = (
  plazasDetalle: any[],
  rango: "dia" | "semana" | "mes"
): GrowthData => {
  if (!plazasDetalle || plazasDetalle.length < 2) {
    return { percentage: "0", isPositive: true }
  }

  // Agrupar por período para calcular tendencia
  const groupedData = plazasDetalle.reduce((acc, plaza) => {
    const dateField = plaza.fechaPublicacion
    if (!dateField) return acc

    const date = new Date(dateField)
    let periodKey: string

    switch (rango) {
      case "dia":
        periodKey = date.toISOString().split("T")[0]
        break
      case "semana":
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        periodKey = startOfWeek.toISOString().split("T")[0]
        break
      case "mes":
      default:
        periodKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`
        break
    }

    acc[periodKey] = (acc[periodKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const periods = Object.keys(groupedData).sort()
  if (periods.length < 2) {
    return { percentage: "0", isPositive: true }
  }

  const firstPeriod = groupedData[periods[0]]
  const lastPeriod = groupedData[periods[periods.length - 1]]

  if (firstPeriod === 0) {
    return { percentage: "100", isPositive: lastPeriod > 0 }
  }

  const percentage = ((lastPeriod - firstPeriod) / firstPeriod) * 100
  return {
    percentage: Math.abs(percentage).toFixed(1),
    isPositive: percentage >= 0,
  }
}

// Función para obtener rango de fechas
const getDateRange = (plazasDetalle: any[]): string => {
  if (!plazasDetalle || plazasDetalle.length === 0) {
    return "Sin datos"
  }

  const dates = plazasDetalle
    .map((plaza) => {
      const dateField = plaza.fechaPublicacion
      return dateField ? new Date(dateField) : null
    })
    .filter((date) => date !== null) as Date[]

  if (dates.length === 0) {
    return "Sin fechas válidas"
  }

  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (minDate.getTime() === maxDate.getTime()) {
    return formatDate(minDate)
  }

  return `${formatDate(minDate)} - ${formatDate(maxDate)}`
}

export function TotalUsersGraphPlazas({
  rango = "mes",
}: TotalUsersGraphPlazasProps) {
  const { data, loading, error, refetch } = usePlazasStats(rango)
  console.log("=== DEBUG HOOK ===")
  console.log("Loading:", loading)
  console.log("Error:", error)
  console.log("Data completa:", data)
  console.log("PlazasDetalle:", data?.plazasDetalle)
  console.log("Tipo de plazasDetalle:", Array.isArray(data?.plazasDetalle))
  console.log("==================")

  // Transformar datos para el gráfico usando PlazaDetalle
  const chartData = data ? transformDataForChart(data.plazasDetalle, rango) : []
  const totalPlazas = data ? calculateTotalPlazas(data.plazasDetalle) : 0
  const growth = data
    ? calculateGrowthPercentage(data.plazasDetalle, rango)
    : { percentage: "0", isPositive: true }
  const dateRange = data ? getDateRange(data.plazasDetalle) : "Sin datos"

  // DEBUG temporal - quita esto cuando funcione
  console.log("🚀 Datos transformados:", {
    chartDataLength: chartData.length,
    totalPlazas,
    growth,
    dateRange,
    firstChartItem: chartData[0],
  })

  // Estado de carga
  if (loading) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Total de Plazas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Cargando datos...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Total de Plazas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm text-red-500 font-medium">
                Error al cargar los datos
              </p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">
          Total de Plazas
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          {/* Número */}
          <span className="text-2xl font-bold text-primary">
            {totalPlazas.toLocaleString()}
          </span>

          {/* Porcentaje */}
          <div
            className={`flex items-center text-sm font-medium ${
              growth.isPositive ? "text-[#61AA12]" : "text-red-500"
            }`}
          >
            {growth.isPositive ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {growth.percentage}%
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={({ payload, label }) => {
                  if (payload && payload.length) {
                    const inmediatas =
                      payload.find((p) => p.dataKey === "inmediatas")?.value ||
                      0
                    const privadas =
                      payload.find((p) => p.dataKey === "privadas")?.value || 0
                    const total = Number(inmediatas) + Number(privadas)

                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{label}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#0E47E1" }}
                          ></div>
                          <span>Plazas Inmediatas: {inmediatas}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#9A75E5" }}
                          ></div>
                          <span>Plazas Privadas: {privadas}</span>
                        </div>
                        <p className="text-sm font-medium border-t pt-1 mt-1">
                          Total: {total}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                dataKey="inmediatas"
                type="natural"
                fill="var(--color-inmediatas)"
                fillOpacity={0.4}
                stroke="var(--color-inmediatas)"
                stackId="a"
              />
              <Area
                dataKey="privadas"
                type="natural"
                fill="var(--color-privadas)"
                fillOpacity={0.4}
                stroke="var(--color-privadas)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No hay datos disponibles
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="mt-2"
              >
                Actualizar
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {growth.isPositive ? "Trending up" : "Trending down"} by{" "}
              {growth.percentage}% this period
              {growth.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {dateRange}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default TotalUsersGraphPlazas
