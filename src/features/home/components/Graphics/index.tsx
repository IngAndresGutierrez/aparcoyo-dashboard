"use client"

import { ArrowUp, ArrowDown, TrendingUp, Loader2 } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useUsuariosStats } from "@/features/users/hooks/useUsers"


export const description =
  "Gráfico de usuarios totales con datos en tiempo real"

// Datos de ejemplo para el gráfico (en producción vendrían del API)
const generateChartData = (usuariosTotales: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const baseValue = Math.max(usuariosTotales - 20, 5)

  return months.map((month, index) => ({
    month,
    activos: Math.floor(baseValue + Math.random() * 10 + index * 2),
    nuevos: Math.floor(2 + Math.random() * 3 + index * 1),
  }))
}

const chartConfig = {
  activos: {
    label: "Usuarios Activos",
    color: "#0E47E1", // azul principal
  },
  nuevos: {
    label: "Usuarios Nuevos",
    color: "#9A75E5", // púrpura
  },
} satisfies ChartConfig

interface TotalUsersGraphProps {
  rango?: "dia" | "semana" | "mes"
}

export function GraphicsHome({ rango = "mes" }: TotalUsersGraphProps) {
  const { data, loading, error } = useUsuariosStats(rango)

  // Calcular datos del gráfico
  const chartData = data ? generateChartData(data.usuariosTotales) : []

  // Calcular crecimiento basado en períodos
  const crecimiento = data
    ? ((data.periodoActual - data.periodoAnterior) /
        Math.max(data.periodoAnterior, 1)) *
      100
    : 0

  const isPositiveGrowth = crecimiento >= 0

  // Estado de carga
  if (loading) {
    return (
      <Card className="">
        <CardHeader className="pb-2 ">
          <CardTitle className="text-sm text-muted-foreground font-medium ">
            Usuarios totales
          </CardTitle>
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="">
          <div className=" flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-full" />
        </CardFooter>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card className="">
        <CardHeader className="pb-2 ">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Usuarios totales
          </CardTitle>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-2xl font-bold text-primary">0</span>
            <div className="flex items-center text-sm text-red-500 font-medium">
              <ArrowDown className="w-4 h-4 mr-1" />
              Error
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Error al cargar datos de usuarios
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            No se pudieron cargar las estadísticas
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">
          Usuarios totales
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          {/* Número total de usuarios */}
          <span className="text-2xl font-bold text-primary">
            {data?.usuariosTotales?.toLocaleString() || 0}
          </span>

          {/* Porcentaje de crecimiento */}
          <div
            className={`flex items-center text-sm font-medium ${
              isPositiveGrowth ? "text-[#61AA12]" : "text-red-500"
            }`}
          >
            {isPositiveGrowth ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(crecimiento).toFixed(1)}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="">
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
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="nuevos"
              type="natural"
              fill="var(--color-nuevos)"
              fillOpacity={0.4}
              stroke="var(--color-nuevos)"
              stackId="a"
            />
            <Area
              dataKey="activos"
              type="natural"
              fill="var(--color-activos)"
              fillOpacity={0.4}
              stroke="var(--color-activos)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isPositiveGrowth ? "Trending up" : "Trending down"} by{" "}
              {Math.abs(crecimiento).toFixed(1)}% this {rango}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {data?.usuariosConPlaza || 0} con plazas •{" "}
              {data?.usuariosNuevos || 0} nuevos • Rango: {rango}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default GraphicsHome
