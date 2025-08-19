"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Users, MapPin } from "lucide-react"
import React from "react"
import { useReservasEstadoStats } from "../../hooks/useReservasState"
// ← CORRECCIÓN: Hook principal

interface MetricCardReservasProps {
  rango?: "dia" | "semana" | "mes"
}

const MetricCardReservas = ({ rango = "mes" }: MetricCardReservasProps) => {
  const { data, loading, error } = useReservasEstadoStats(rango) // ← CORRECCIÓN: Hook principal

  // Si está cargando, mostrar skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full">
        {[1, 2].map((index) => (
          <Card
            key={index}
            className="p-4 sm:p-6 min-h-[116px] max-w-full"
          >
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </Card>
        ))}
      </div>
    )
  }

  // Si hay error, mostrar métricas en 0
  if (error) {
    const errorCards = [
      {
        title: "Plazas con reservas activas",
        value: "0",
        icon: <MapPin className="h-4 w-4" />,
        percentage: "0%",
        isPositive: true,
      },
      {
        title: "Total reservas",
        value: "0",
        icon: <Users className="h-4 w-4" />,
        percentage: "0%",
        isPositive: true,
      },
    ]

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full">
        {errorCards.map((card, index) => (
          <Card
            key={index}
            className="p-4 sm:p-6 min-h-[116px] relative max-w-full"
          >
            <p className="absolute top-2 right-2 text-sm text-gray-400">
              Error
            </p>
            <div className="flex items-center gap-2 mb-1">
              {card.icon}
              <h2 className="text-sm sm:text-base font-semibold text-tertiary">
                {card.title}
              </h2>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
          </Card>
        ))}
      </div>
    )
  }

  // Calcular métricas basadas en los datos reales
  const totalReservas = data?.reservasTotal || 0
  const plazasConReservas = data?.plazasConReservaActiva || 0
  const reservasCanceladas = data?.reservasCanceladas || 0

  // Simular crecimiento (en un caso real vendría de comparación temporal)
  const reservasGrowth = totalReservas > 0 ? 15.5 : 0
  const plazasGrowth = plazasConReservas > 0 ? 8.2 : 0

  const cards = [
    {
      title: "Plazas con reservas activas",
      value: plazasConReservas.toString(),
      icon: <MapPin className="h-4 w-4 text-blue-600" />,
      percentage: `+${plazasGrowth}%`,
      isPositive: true,
    },
    {
      title: "Total reservas",
      value: totalReservas.toString(),
      icon: <Users className="h-4 w-4 text-green-600" />,
      percentage: `+${reservasGrowth}%`,
      isPositive: totalReservas > reservasCanceladas,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full overflow-hidden">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="p-4 sm:p-6 min-h-[116px] relative hover:shadow-md transition-shadow max-w-full"
        >
          {/* Porcentaje en esquina superior derecha */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {card.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <p
              className={`text-xs sm:text-sm font-medium ${
                card.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {card.percentage}
            </p>
          </div>

          {/* Título con icono */}
          <div className="flex items-center gap-2 mb-1 overflow-hidden">
            {card.icon}
            <h2 className="text-sm sm:text-base font-semibold text-tertiary truncate">
              {card.title}
            </h2>
          </div>

          {/* Valor principal */}
          <p className="text-xl sm:text-2xl font-bold mb-1">{card.value}</p>

          {/* Sin descripción adicional */}
        </Card>
      ))}
    </div>
  )
}

export default MetricCardReservas