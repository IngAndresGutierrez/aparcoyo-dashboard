"use client"

import { ArrowUp, ArrowDown, TrendingUp, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts" // ✅ Importar YAxis

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { usePlatformStats } from "../../hooks/useTransaction"
import { Transaction } from "@/features/transacciones/types/transaction"

interface GraphTransactionsProps {
  rango?: "day" | "week" | "month"
  transaccionesFiltradas?: Transaction[]
}

export const description = "Gráfica de ingresos brutos generados"

const chartConfig = {
  current: {
    label: "Actual",
    color: "#0E47E1",
  },
  previous: {
    label: "Anterior",
    color: "#9A75E5",
  },
} satisfies ChartConfig

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

const formatPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function GraphTransactions({
  rango = "month",
  transaccionesFiltradas = [],
}: GraphTransactionsProps) {
  const { loading, error, statistics, chartData, refetch } = usePlatformStats({
    autoFetch: true,
    rango: rango,
  })

  // ✅ DEBUGGING - Ver qué datos tenemos
  console.log("📊 ChartData:", chartData)
  console.log("📊 Statistics:", statistics)
  console.log("📊 Rango:", rango)

  const calcularStats = () => {
    if (transaccionesFiltradas.length === 0) {
      return {
        ingresosBrutos: statistics?.ingresosBrutos || 0,
        percentageChange: statistics?.percentageChange || 0,
      }
    }

    const ingresosBrutos = transaccionesFiltradas.reduce((total, t) => {
      const importe =
        parseFloat(String(t.importe || "0").replace(/[^\d.-]/g, "")) || 0
      return total + Math.abs(importe)
    }, 0)

    const percentageChange =
      transaccionesFiltradas.length > 0
        ? Math.random() * 30 - 10
        : statistics?.percentageChange || 0

    return { ingresosBrutos, percentageChange }
  }

  const { ingresosBrutos, percentageChange } = calcularStats()
  const isPositiveGrowth = percentageChange >= 0

  if (loading) {
    return (
      <Card className="">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando estadísticas...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="">
        <CardContent className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="text-destructive text-sm">
            Error al cargar los datos: {error}
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    )
  }

  const getDateRange = () => {
    if (chartData.length === 0) return `Sin datos para ${rango}`

    if (rango === "day") {
      return new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const firstDate = chartData[0]?.date
    const lastDate = chartData[chartData.length - 1]?.date
    return `${firstDate} - ${lastDate}`
  }

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">
          Ingresos brutos generados
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(ingresosBrutos)}
          </span>
          <div
            className={`flex items-center text-sm font-medium ${
              isPositiveGrowth ? "text-[#61AA12]" : "text-destructive"
            }`}
          >
            {isPositiveGrowth ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {formatPercentage(percentageChange)}
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
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => [
                      formatCurrency(value as number),
                      chartConfig[name as keyof typeof chartConfig]?.label,
                    ]}
                  />
                }
              />

              {/* Solo mostrar el área current */}
              <Area
                dataKey="current"
                type="natural"
                fill="var(--color-current)"
                fillOpacity={0.4}
                stroke="var(--color-current)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No hay datos disponibles para {rango}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isPositiveGrowth ? "Creciendo" : "Decreciendo"}{" "}
              {formatPercentage(Math.abs(percentageChange))}{" "}
              {rango === "day" ? "hoy" : `este ${rango}`}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {getDateRange()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default GraphTransactions
