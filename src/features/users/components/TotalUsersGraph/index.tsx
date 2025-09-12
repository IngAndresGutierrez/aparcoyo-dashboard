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
import { useUsuariosStats } from "../../hooks/useUsers"

export const description =
  "Gráfico de usuarios totales con datos en tiempo real"

interface UsuarioTabla {
  email: string
  fechaRegistro: string
  reservasHechas: number
  plazasPublicadas: number
}

interface TotalUsersGraphProps {
  rango?: "dia" | "semana" | "mes"
  usuariosFiltrados?: UsuarioTabla[]
}

// Datos de ejemplo para el gráfico
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
    color: "#0E47E1",
  },
  nuevos: {
    label: "Usuarios Nuevos",
    color: "#9A75E5",
  },
} satisfies ChartConfig

export function TotalUsersGraph({
  rango = "mes",
  usuariosFiltrados = [],
}: TotalUsersGraphProps) {
  const { data: hookData, loading, error } = useUsuariosStats(rango)

  // Calcular estadísticas desde usuarios filtrados
  const calcularEstadisticasLocales = () => {
    if (usuariosFiltrados.length === 0) {
      return {
        usuariosTotales: 0,
        usuariosNuevos: 0,
        usuariosConPlaza: 0,
        periodoActual: 0,
        periodoAnterior: 0,
      }
    }

    // Calcular fecha límite para "nuevos" según el rango
    const now = new Date()
    const fechaLimite = new Date()

    switch (rango) {
      case "dia":
        fechaLimite.setDate(now.getDate() - 1)
        break
      case "semana":
        fechaLimite.setDate(now.getDate() - 7)
        break
      case "mes":
        fechaLimite.setMonth(now.getMonth() - 1)
        break
    }

    const usuariosNuevos = usuariosFiltrados.filter((usuario) => {
      const fechaRegistro = new Date(usuario.fechaRegistro)
      return fechaRegistro >= fechaLimite
    }).length

    const usuariosConPlaza = usuariosFiltrados.filter(
      (usuario) => (usuario.plazasPublicadas || 0) > 0
    ).length

    const usuariosTotales = usuariosFiltrados.length

    // Simular crecimiento para el porcentaje
    const periodoAnterior = Math.max(1, Math.floor(usuariosTotales * 0.85))
    const periodoActual = usuariosTotales

    return {
      usuariosTotales,
      usuariosNuevos,
      usuariosConPlaza,
      periodoActual,
      periodoAnterior,
    }
  }

  // Si hay usuarios filtrados, usar cálculos locales
  const usarCalculosLocales = usuariosFiltrados.length > 0
  const estadisticasLocales = usarCalculosLocales
    ? calcularEstadisticasLocales()
    : null

  // Usar datos calculados localmente o del hook
  const data = estadisticasLocales || {
    usuariosTotales: hookData?.usuariosTotales || 0,
    usuariosNuevos: hookData?.usuariosNuevos || 0,
    usuariosConPlaza: hookData?.usuariosConPlaza || 0,
    periodoActual: hookData?.periodoActual || 0,
    periodoAnterior: hookData?.periodoAnterior || 0,
  }

  // Calcular crecimiento basado en períodos
  const crecimiento = data
    ? ((data.periodoActual - data.periodoAnterior) /
        Math.max(data.periodoAnterior, 1)) *
      100
    : 0

  const isPositiveGrowth = crecimiento >= 0

  // Calcular datos del gráfico
  const chartData = data ? generateChartData(data.usuariosTotales) : []

  if (loading && !usarCalculosLocales) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Usuarios totales
          </CardTitle>
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-full" />
        </CardFooter>
      </Card>
    )
  }

  if (error && !usarCalculosLocales) {
    return (
      <Card className="">
        <CardHeader className="pb-2">
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
        <div className="flex items-center gap-2 pt-1">
          <span className="text-2xl font-bold text-primary">
            {data.usuariosTotales.toLocaleString()}
          </span>
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

      <CardContent>
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
              {data.usuariosConPlaza} con plazas • {data.usuariosNuevos} nuevos
              • Rango: {rango}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default TotalUsersGraph
