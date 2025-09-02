"use client"

import MetricCard from "@/features/shared/components/MetricCard"
import { Users, MapPin, CheckCircle, Loader2 } from "lucide-react" // ← ICONOS
import { useUsuariosStats } from "../../hooks/useUsers"

interface MetricsCardsListProps {
  rango?: "dia" | "semana" | "mes"
}

const MetricsCardsList = ({ rango = "mes" }: MetricsCardsListProps) => {
  const { data, loading, error } = useUsuariosStats(rango) // ← USAR EL HOOK

  // Calcular crecimiento basado en períodos
  const calcularCrecimiento = (actual: number, anterior: number) => {
    if (anterior === 0) return actual > 0 ? 100 : 0
    return (actual / anterior) * 100 - 100
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-100">
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

  // Error state
  if (error) {
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

  // Datos reales del backend
  const cardsItems = [
    {
      title: "Usuarios nuevos este periodo",
      value: data?.usuariosNuevos?.toString() || "0", // ← DATO REAL
      icon: <Users className="h-4 w-4 text-blue-600" />,
      percentage: `+${calcularCrecimiento(
        data?.usuariosNuevos || 0,
        Math.max((data?.usuariosTotales || 0) - (data?.usuariosNuevos || 0), 1)
      ).toFixed(1)}%`,
    },
    {
      title: "Publicado al menos una plaza",
      value: data?.usuariosConPlaza?.toString() || "0", // ← DATO REAL
      icon: <MapPin className="h-4 w-4 text-green-600" />,
      percentage: `+${calcularCrecimiento(
        data?.usuariosConPlaza || 0,
        Math.max(
          (data?.usuariosTotales || 0) - (data?.usuariosConPlaza || 0),
          1
        )
      ).toFixed(1)}%`,
    },
    {
      title: "Usuarios con reservas completadas",
      value: data?.usuariosConReserva?.toString() || "0", // ← DATO REAL
      icon: <CheckCircle className="h-4 w-4 text-purple-600" />,
      percentage:
        data?.usuariosConReserva === 0
          ? "0%"
          : `+${calcularCrecimiento(
              data?.usuariosConReserva || 0,
              Math.max(
                (data?.usuariosTotales || 0) - (data?.usuariosConReserva || 0),
                1
              )
            ).toFixed(1)}%`,
    },
  ]

  const renderCards = cardsItems.map((item, index) => {
    return (
      <MetricCard
        key={index}
        title={item.title}
        value={item.value}
        percentage={item.percentage}
        // Si tu MetricCard acepta un prop para el icono, descomenta la siguiente línea:
        // icon={item.icon}
      />
    )
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderCards}
    </div>
  )
}

export default MetricsCardsList
