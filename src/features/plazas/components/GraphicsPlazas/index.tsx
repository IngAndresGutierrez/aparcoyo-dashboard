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



import { usePlazasStats } from "../../hooks/useGetRangePlazas"
import { ChartDataPoint, GrowthData, PlazaPorRango } from "../../types/range"

export const description = "An area chart with a legend"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#0E47E1", // azul nuevo
  },
  mobile: {
    label: "Mobile", 
    color: "#9A75E5", // azul nuevo
  },
} satisfies ChartConfig

interface TotalUsersGraphPlazasProps {
  rango?: "dia" | "semana" | "mes"
}

// Función para transformar datos del backend al formato del gráfico
const transformDataForChart = (plazasPorRango: PlazaPorRango[]): ChartDataPoint[] => {
  if (!plazasPorRango || !Array.isArray(plazasPorRango)) {
    return []
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return plazasPorRango.map((item, index) => {
    const date = new Date(item.periodo)
    const cantidad = parseInt(item.cantidad) || 0
    
    return {
      month: monthNames[date.getMonth()] || `Periodo ${index + 1}`,
      desktop: cantidad,
      mobile: Math.floor(cantidad * 0.6), // Simulamos datos mobile como 60% del desktop
      date: item.periodo,
      fullMonth: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    }
  })
}

// Función para calcular total de usuarios
const calculateTotalUsers = (plazasPorRango: PlazaPorRango[]): number => {
  if (!plazasPorRango || !Array.isArray(plazasPorRango)) {
    return 0
  }

  return plazasPorRango.reduce((total, item) => {
    return total + (parseInt(item.cantidad) || 0)
  }, 0)
}

// Función para calcular porcentaje de crecimiento
const calculateGrowthPercentage = (plazasPorRango: PlazaPorRango[]): GrowthData => {
  if (!plazasPorRango || plazasPorRango.length < 2) {
    return { percentage: "0", isPositive: true }
  }

  // Ordenar por fecha
  const sortedData = [...plazasPorRango].sort((a, b) => 
    new Date(a.periodo).getTime() - new Date(b.periodo).getTime()
  )
  
  const firstValue = parseInt(sortedData[0].cantidad) || 0
  const lastValue = parseInt(sortedData[sortedData.length - 1].cantidad) || 0
  
  if (firstValue === 0) {
    return { percentage: "100", isPositive: lastValue > 0 }
  }

  const percentage = ((lastValue - firstValue) / firstValue) * 100
  return {
    percentage: Math.abs(percentage).toFixed(1),
    isPositive: percentage >= 0
  }
}

// Función para obtener rango de fechas
const getDateRange = (plazasPorRango: PlazaPorRango[]): string => {
  if (!plazasPorRango || plazasPorRango.length === 0) {
    return "Sin datos"
  }

  const dates = plazasPorRango.map(item => new Date(item.periodo))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (minDate.getTime() === maxDate.getTime()) {
    return formatDate(minDate)
  }

  return `${formatDate(minDate)} - ${formatDate(maxDate)}`
}

export function TotalUsersGraphPlazas({ rango = "mes" }: TotalUsersGraphPlazasProps) {
  const { data, loading, error, refetch } = usePlazasStats(rango)

  // Transformar datos para el gráfico
  const chartData = data ? transformDataForChart(data.plazasPorRango) : []
  const totalUsers = data ? calculateTotalUsers(data.plazasPorRango) : 0
  const growth = data ? calculateGrowthPercentage(data.plazasPorRango) : { percentage: "0", isPositive: true }
  const dateRange = data ? getDateRange(data.plazasPorRango) : "Sin datos"

  // Estado de carga
  if (loading) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Usuarios totales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Cargando datos...</span>
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
            Usuarios totales
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
          Usuarios totales
        </CardTitle>

        <div className="flex items-center gap-2 pt-1">
          {/* Número */}
          <span className="text-2xl font-bold text-primary">
            {totalUsers.toLocaleString()}
          </span>

          {/* Porcentaje */}
          <div className={`flex items-center text-sm font-medium ${
            growth.isPositive ? 'text-[#61AA12]' : 'text-red-500'
          }`}>
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
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
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
              {growth.isPositive ? 'Trending up' : 'Trending down'} by {growth.percentage}% this period 
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