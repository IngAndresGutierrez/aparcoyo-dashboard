/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useReservasPlazasStats } from "../../hooks/useReservas"

export const description =
  "Gráfico de barras horizontales para plazas más reservadas"

const chartConfig = {
  reservas: {
    label: "Reservas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const colors = [
  "#0E47E1", // Azul
  "#9A75E5", // Violeta
  "#D7AFEE", // Rosa claro
  "#EEAFD5", // Rosa
  "#D9E2FD", // Azul claro
  "#4ADE80", // Verde claro
  "#F59E0B", // Naranja
  "#EF4444", // Rojo
  "#8B5CF6", // Violeta oscuro
  "#06B6D4", // Cyan
]

interface ReservationsChartProps {
  rango?: "dia" | "semana" | "mes"
}

const ReservationsChart = ({ rango = "mes" }: ReservationsChartProps) => {
  const { plazasData, loading, error, refetch, stats } =
    useReservasPlazasStats(rango)

  console.log("🏛️ Debug datos del hook de plazas:", {
    plazasData,
    loading,
    error,
    stats,
  })

  // Transformar datos para el gráfico - NOMBRES MÁS CLAROS
  const chartData =
    plazasData?.map((plaza, index) => ({
      plaza: plaza.displayName || plaza.plaza,
      reservas: Number(plaza.cantidad) || 0,
      plazaCompleta: plaza.plaza,
      index,
    })) || []

  console.log("📊 Datos transformados para el gráfico de plazas:", chartData)

  // Estado de carga
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plazas más reservadas</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Cargando estadísticas de plazas...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plazas más reservadas</CardTitle>
          <CardDescription>Error al cargar</CardDescription>
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

  // Sin datos - VERIFICACIÓN MEJORADA
  if (!Array.isArray(plazasData) || plazasData.length === 0) {
    console.log("⚠️ No hay datos de plazas para mostrar:", {
      plazasData,
      isArray: Array.isArray(plazasData),
    })
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plazas más reservadas</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No hay plazas reservadas para mostrar
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
        </CardContent>
      </Card>
    )
  }

  const rangeLabels = {
    dia: "hoy",
    semana: "esta semana",
    mes: "este mes",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plazas más reservadas</CardTitle>
        <CardDescription>
          {stats?.totalPlazas || chartData.length} plaza
          {(stats?.totalPlazas || chartData.length) !== 1 ? "s" : ""} • Rango:{" "}
          {rangeLabels[rango]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 10,
              top: 5,
              bottom: 5,
            }}
            height={Math.max(200, chartData.length * 50)} // Altura dinámica
          >
            <XAxis
              type="number"
              dataKey="reservas"
              hide
              domain={[0, "dataMax"]}
            />
            <YAxis
              dataKey="plaza"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
              tickFormatter={(value) => {
                if (typeof value === "string") {
                  return value.length > 12 ? value.slice(0, 12) + "..." : value
                }
                return String(value)
              }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="font-medium">
                        {data.plazaCompleta || data.plaza}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total reservas:{" "}
                        <span className="font-semibold">{data.reservas}</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="reservas"
              radius={[0, 4, 4, 0]}
              minPointSize={2} // Asegura que las barras pequeñas sean visibles
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {stats?.topPlaza && (
          <div className="flex gap-2 leading-none font-medium">
            Plaza líder: {stats.topPlaza} <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          Total reservas:{" "}
          {stats?.totalReservas ||
            chartData.reduce((sum, item) => sum + item.reservas, 0)}{" "}
          • Promedio por plaza:{" "}
          {stats?.averageCantidad ||
            Math.round(
              chartData.reduce((sum, item) => sum + item.reservas, 0) /
                chartData.length
            )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ReservationsChart
