"use client"

import MetricCard from "@/features/shared/components/MetricCard"
import { Loader2 } from "lucide-react"
import { useUsuariosStats } from "../../hooks/useUsers"

interface UsuarioTabla {
  email: string
  fechaRegistro: string
  reservasHechas: number
  plazasPublicadas: number
  // ... otras propiedades
}

interface MetricsCardsListProps {
  rango?: "dia" | "semana" | "mes"
  usuariosFiltrados?: UsuarioTabla[] // Datos ya filtrados por fecha
}

const MetricsCardsList = ({
  rango = "mes",
  usuariosFiltrados = [],
}: MetricsCardsListProps) => {
  const { data: hookData, loading, error } = useUsuariosStats(rango)

  // Función para calcular estadísticas desde usuarios filtrados
  const calcularEstadisticasLocales = () => {
    if (usuariosFiltrados.length === 0) {
      return {
        usuariosNuevos: 0,
        usuariosConPlaza: 0,
        usuariosConReserva: 0,
        usuariosTotales: 0,
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

    const usuariosConReserva = usuariosFiltrados.filter(
      (usuario) => (usuario.reservasHechas || 0) > 0
    ).length

    return {
      usuariosNuevos,
      usuariosConPlaza,
      usuariosConReserva,
      usuariosTotales: usuariosFiltrados.length,
    }
  }

  // Si hay usuarios filtrados, usar cálculos locales
  const usarCalculosLocales = usuariosFiltrados.length > 0
  const estadisticasLocales = usarCalculosLocales
    ? calcularEstadisticasLocales()
    : null

  if (loading && !usarCalculosLocales) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="p-6 border rounded-lg bg-card flex items-center justify-center min-h-[120px]"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    )
  }

  if (error && !usarCalculosLocales) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Usuarios nuevos este periodo", defaultValue: "0" },
          { title: "Publicado al menos una plaza", defaultValue: "0" },
          { title: "Usuarios con reservas completadas", defaultValue: "0" },
        ].map((item, index) => (
          <MetricCard
            key={index}
            title={item.title}
            value={item.defaultValue}
            percentage="Error"
          />
        ))}
      </div>
    )
  }

  const calcularPorcentajeCrecimiento = (
    actual: number,
    anterior: number
  ): string => {
    if (anterior === 0) return actual > 0 ? "+100%" : "0%"
    const crecimiento = ((actual - anterior) / anterior) * 100
    const signo = crecimiento >= 0 ? "+" : ""
    return `${signo}${crecimiento.toFixed(1)}%`
  }

  const calcularPorcentajeDelTotal = (valor: number, total: number): string => {
    if (total === 0) return "0%"
    const porcentaje = (valor / total) * 100
    return `${porcentaje.toFixed(1)}%`
  }

  // Usar datos calculados localmente o del hook
  const datos = estadisticasLocales || {
    usuariosNuevos: hookData?.usuariosNuevos || 0,
    usuariosConPlaza: hookData?.usuariosConPlaza || 0,
    usuariosConReserva: hookData?.usuariosConReserva || 0,
    usuariosTotales: hookData?.usuariosTotales || 1,
  }

  const cardsItems = [
    {
      title: "Usuarios nuevos este periodo",
      value: datos.usuariosNuevos.toLocaleString(),
      percentage: usarCalculosLocales
        ? `+${calcularPorcentajeDelTotal(
            datos.usuariosNuevos,
            datos.usuariosTotales
          )}`
        : calcularPorcentajeCrecimiento(
            hookData?.periodoActual || 0,
            hookData?.periodoAnterior || 0
          ),
    },
    {
      title: "Publicado al menos una plaza",
      value: datos.usuariosConPlaza.toLocaleString(),
      percentage: calcularPorcentajeDelTotal(
        datos.usuariosConPlaza,
        datos.usuariosTotales
      ),
    },
    {
      title: "Usuarios con reservas completadas",
      value: datos.usuariosConReserva.toLocaleString(),
      percentage: calcularPorcentajeDelTotal(
        datos.usuariosConReserva,
        datos.usuariosTotales
      ),
    },
  ]

  return (
    <div className="space-y-2">
      {/* Remover este indicador para producción */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardsItems.map((item, index) => (
          <MetricCard
            key={index}
            title={item.title}
            value={item.value}
            percentage={item.percentage}
          />
        ))}
      </div>
    </div>
  )
}

export default MetricsCardsList
