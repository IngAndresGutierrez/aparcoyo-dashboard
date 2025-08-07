/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
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
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useReservasEstadoStats } from "../../hooks/useReservasState"



export const description = "Gráfico de área para estados de reservas"

const chartConfig = {
  confirmado: {
    label: "Confirmadas",
    color: "#22C55E", // Verde
  },
  pendiente: {
    label: "Pendientes", 
    color: "#0E47E1", // Amarillo/Naranja
  },
  cancelado: {
    label: "Canceladas",
    color: "#9A75E5", // Rojo
  },
} satisfies ChartConfig

interface TotalUsersGraphReservasProps {
  rango?: "dia" | "semana" | "mes"
}

// Función para transformar datos para el gráfico de área temporal
const transformDataForAreaChart = (estadoData: any[], rango: "dia" | "semana" | "mes") => {
  // Para el gráfico de área, necesitamos datos temporales
  // Por ahora simularemos datos históricos basados en los totales actuales
  const periods = rango === "dia" ? 7 : rango === "semana" ? 4 : 6
  const baseData = estadoData.reduce((acc, item) => {
    acc[item.estado] = item.cantidad
    return acc
  }, {} as Record<string, number>)

  const timeLabels = {
    dia: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
    semana: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    mes: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  }

  return timeLabels[rango].map((label, index) => {
    const factor = 0.7 + (Math.random() * 0.6) // Variación entre 0.7 y 1.3
    return {
      period: label,
      confirmado: Math.round((baseData.confirmado || 0) * factor),
      pendiente: Math.round((baseData.pendiente || 0) * factor),
      cancelado: Math.round((baseData.cancelado || 0) * factor),
    }
  })
}

export function TotalUsersGraphReservas({ rango = "mes" }: TotalUsersGraphReservasProps) {
  const { estadoData, loading, error, refetch, stats } = useReservasEstadoStats(rango)

  // Transformar datos para el gráfico de área
  const chartData = estadoData.length > 0 ? transformDataForAreaChart(estadoData, rango) : []
  
  // Calcular totales y crecimiento basados en la respuesta real
  const totalReservas = stats?.reservasTotal || 0
  const topEstado = stats?.topEstado || "N/A"
  const reservasCanceladas = stats?.reservasCanceladas || 0
  const plazasConReservaActiva = stats?.plazasConReservaActiva || 0
  
  // Simular crecimiento (en un caso real vendría del backend)
  const growthPercentage = totalReservas > 0 ? 5.2 : 0
  const isPositiveGrowth = growthPercentage >= 0

  const rangeLabels = {
    dia: "hoy",
    semana: "esta semana",
    mes: "este mes"
  }

  // Estado de carga
  if (loading) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Reservas totales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Cargando estadísticas de reservas...</span>
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
            Reservas totales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm text-red-500 font-medium">Error al cargar los datos</p>
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
          Reservas totales
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          {/* Número */}
          <span className="text-2xl font-bold text-primary">
            {totalReservas.toLocaleString()}
          </span>

          {/* Porcentaje */}
          <div className={`flex items-center text-sm font-medium ${
            isPositiveGrowth ? 'text-[#61AA12]' : 'text-red-500'
          }`}>
            {isPositiveGrowth ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(growthPercentage)}%
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
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="cancelado"
                type="natural"
                fill="var(--color-cancelado)"
                fillOpacity={0.4}
                stroke="var(--color-cancelado)"
                stackId="a"
              />
              <Area
                dataKey="pendiente"
                type="natural"
                fill="var(--color-pendiente)"
                fillOpacity={0.4}
                stroke="var(--color-pendiente)"
                stackId="a"
              />
              <Area
                dataKey="confirmado"
                type="natural"
                fill="var(--color-confirmado)"
                fillOpacity={0.4}
                stroke="var(--color-confirmado)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
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
              {isPositiveGrowth ? 'Trending up' : 'Trending down'} by {Math.abs(growthPercentage)}% this period
              {isPositiveGrowth ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Estado líder: {topEstado} • Canceladas: {reservasCanceladas} • Activas: {plazasConReservaActiva} • Rango: {rangeLabels[rango]}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default TotalUsersGraphReservas