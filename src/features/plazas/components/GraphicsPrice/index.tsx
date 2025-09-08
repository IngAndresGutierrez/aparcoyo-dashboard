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
import { usePlazasTypeStats } from "../../hooks/useChartPrice"

export const description = "A horizontal bar chart for types"

const chartConfig = {
  averagePrice: {
    label: "Precio Promedio",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const colors = [
  "#0E47E1", // Azul
  "#9A75E5", // Verde
  "#D7AFEE", // Amarillo
  "#EEAFD5", // Rojo
  "#D9E2FD", // Morado
  "#4ADE80", // Verde claro
]

interface ChartBarHorizontalTypeProps {
  rango?: "dia" | "semana" | "mes"
}

const ChartBarHorizontalType = ({
  rango = "mes",
}: ChartBarHorizontalTypeProps) => {
  const { typeData, loading, error, refetch, stats } = usePlazasTypeStats(rango)

  // Transformar datos para el gráfico
  const chartData = typeData.map((type) => ({
    month: type.displayName,
    desktop: type.averagePrice,
    count: type.count,
    fullName: type.tipo,
  }))

  // Estado de carga
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Precio promedio por tipo</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Cargando estadísticas de tipos...
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
          <CardTitle>Precio promedio por tipo</CardTitle>
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

  // Sin datos
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Precio promedio por tipo</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No hay datos de tipos para mostrar
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
        <CardTitle>Precio promedio por tipo</CardTitle>
        <CardDescription>
          {stats?.totalTypes} tipos • {stats?.totalPlazas} plazas • Rango:{" "}
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
              left: 50,
              right: 20,
            }}
          >
            <XAxis
              type="number"
              dataKey="desktop"
              hide
            />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 8 ? value.slice(0, 8) + "..." : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={({ payload, label }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        Precio promedio: ${data.desktop?.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total plazas: {data.count}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="desktop"
              radius={5}
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
        <div className="flex gap-2 leading-none font-medium">
          Tipo líder: {stats?.topType} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Precio promedio general: ${stats?.averagePrice?.toLocaleString()} •
          Públicas: {stats?.plazasPublicadas} • Privadas:{" "}
          {stats?.plazasPrivadas}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartBarHorizontalType
