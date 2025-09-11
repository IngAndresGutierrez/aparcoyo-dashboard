/* eslint-disable @typescript-eslint/no-explicit-any */
// MetricsCardsListHome.tsx
"use client"

import React from "react"
import MetricCard from "@/features/shared/components/MetricCard"
import { TimeFilter } from "../../hooks/useMetrics"

// ✅ NUEVO: Props interface
interface MetricsCardsProps {
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  metrics: any
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface CardItem {
  title: string
  value: string
  icon: string
  percentage: string
  hasError: boolean
  period?: string
}

// ✅ MODIFICADO: Componente recibe props en lugar de usar useMetrics
const MetricsCardsListHome: React.FC<MetricsCardsProps> = ({
  timeFilter,
 
  metrics,
  loading,
  error,
  refetch,
}) => {
  // ❌ REMOVIDO: const { metrics, loading, error, timeFilter, refetch } = useMetrics()

  // ✅ DEBUG: Ver si recibe las props correctamente
  React.useEffect(() => {
    console.log("📊 MetricsCards - Props recibidas:", {
      timeFilter,
      loading,
      usuarios: metrics?.users?.value || 0,
      plazas: metrics?.plazas?.value || 0,
      reservasActivas: metrics?.activeReservas?.value || 0,
      reservasTotales: metrics?.totalReservas?.value || 0,
    })
  }, [timeFilter, loading, metrics])

  const getPeriodLabel = () => {
    switch (timeFilter) {
      case "day":
        return "últimas 24h"
      case "week":
        return "últimos 7 días"
      case "month":
        return "últimos 30 días"
      default:
        return "período actual"
    }
  }

  // ✅ MODIFICADO: Usar optional chaining para props
  const cardsItems: CardItem[] = [
    {
      title: "Usuarios totales",
      value: metrics?.users?.loading
        ? "..."
        : metrics?.users?.error
        ? "Error"
        : (metrics?.users?.value || 0).toLocaleString(),
      icon: "/home/arrow-up.svg",
      percentage: "+100%",
      hasError: !!metrics?.users?.error,
      period: getPeriodLabel(),
    },
    {
      title: "Plazas totales",
      value: metrics?.plazas?.loading
        ? "..."
        : metrics?.plazas?.error
        ? "Error"
        : (metrics?.plazas?.value || 0).toLocaleString(),
      icon: "/home/arrow-up.svg",
      percentage: "+25%",
      hasError: !!metrics?.plazas?.error,
      period: "total disponible",
    },
    {
      title: "Plazas con reserva activa",
      value: metrics?.activeReservas?.loading
        ? "..."
        : metrics?.activeReservas?.error
        ? "Error"
        : `${(metrics?.activeReservas?.value || 0).toLocaleString()}${
            (metrics?.plazas?.value || 0) > 0
              ? ` (${(
                  ((metrics?.activeReservas?.value || 0) /
                    metrics.plazas.value) *
                  100
                ).toFixed(1)}%)`
              : ""
          }`,
      icon: "/home/arrow-down.svg",
      percentage: "-10%",
      hasError: !!metrics?.activeReservas?.error,
      period: getPeriodLabel(),
    },
    {
      title: "Reservas totales",
      value: metrics?.totalReservas?.loading
        ? "..."
        : metrics?.totalReservas?.error
        ? "Error"
        : (metrics?.totalReservas?.value || 0).toLocaleString(),
      icon: "/home/arrow-down.svg",
      percentage: "-8%",
      hasError: !!metrics?.totalReservas?.error,
      period: getPeriodLabel(),
    },
  ]

  const renderCards = cardsItems.map((item: CardItem, index: number) => {
    return (
      <div
        key={index}
        className="relative"
      >
        <MetricCard
          title={item.title}
          value={item.value}
          percentage={item.percentage}
        />

        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {item.period}
        </div>

        {item.hasError && (
          <div className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center">
            <span className="text-red-600 text-sm font-medium">
              Error de datos
            </span>
          </div>
        )}

        {(loading ||
          metrics?.users?.loading ||
          metrics?.plazas?.loading ||
          metrics?.activeReservas?.loading ||
          metrics?.totalReservas?.loading) && (
          <div className="absolute inset-0 bg-background/50 rounded flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    )
  })

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full text-center py-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-red-600 mb-2">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">Error cargando métricas</p>
            <p className="text-sm text-red-500 mt-1">
              Período: {getPeriodLabel()} • {error}
            </p>
          </div>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Reintentar carga
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 rounded-lg animate-pulse"
          >
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métricas Generales</h3>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
            📅 {getPeriodLabel()}
          </span>
          <button
            onClick={refetch}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Actualizar datos"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderCards}
      </div>

      {/* DEBUG temporal */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
          <strong>DEBUG Cards:</strong> Filtro: {timeFilter} | Loading:{" "}
          {loading ? "Sí" : "No"} | Usuarios: {metrics?.users?.value || 0} |
          Reservas: {metrics?.totalReservas?.value || 0}
        </div>
      )}
    </div>
  )
}

export default MetricsCardsListHome
