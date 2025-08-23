// MetricsCardsListHome.tsx
"use client"

import MetricCard from "@/features/shared/components/MetricCard"
import { useMetrics } from "../../hooks/useMetrics"


interface CardItem {
  title: string
  value: string
  icon: string
  percentage: string
  hasError: boolean
}

const MetricsCardsListHome: React.FC = () => {
  const { metrics,  error, refetch } = useMetrics()

  const cardsItems: CardItem[] = [
    {
      title: "Usuarios totales",
      value: metrics.users.loading
        ? "..."
        : metrics.users.error
        ? "Error"
        : metrics.users.value.toString(),
      icon: "/home/arrow-up.svg",
      percentage: "+100%",
      hasError: !!metrics.users.error,
    },
    {
      title: "Plazas totales",
      value: metrics.plazas.loading
        ? "..."
        : metrics.plazas.error
        ? "Error"
        : metrics.plazas.value.toString(),
      icon: "/home/arrow-up.svg",
      percentage: "+25%",
      hasError: !!metrics.plazas.error,
    },
    {
      title: "Plazas con reserva activa",
      value: metrics.activeReservas.loading
        ? "..."
        : metrics.activeReservas.error
        ? "Error"
        : metrics.activeReservas.value.toString(),
      icon: "/home/arrow-down.svg",
      percentage: "-10%",
      hasError: !!metrics.activeReservas.error,
    },
    {
      title: "Reservas totales",
      value: metrics.totalReservas.loading
        ? "..."
        : metrics.totalReservas.error
        ? "Error"
        : metrics.totalReservas.value.toString(),
      icon: "/home/arrow-down.svg",
      percentage: "-8%",
      hasError: !!metrics.totalReservas.error,
    },
  ]

  const renderCards = cardsItems.map((item: CardItem, index: number) => {
    return (
      <MetricCard
        key={index}
        title={item.title}
        value={item.value}
        percentage={item.percentage}
        // hasError={item.hasError} // Descomenta si tu MetricCard acepta esta prop
      />
    )
  })

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full text-center py-4">
          <p className="text-red-500 mb-2">Error cargando métricas</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {renderCards}
    </div>
  )
}

export default MetricsCardsListHome
