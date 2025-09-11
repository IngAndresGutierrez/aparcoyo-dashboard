/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { TimeFilter } from "../../hooks/useMetrics"

// ✅ NUEVA INTERFAZ: Recibe props en lugar de usar hooks internos
interface UsersTotalsCardsProps {
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  metrics: any
  financialData: any
  loading: boolean
  error: string | null
  isAdmin?: boolean // Para determinar si usar estadísticas de plataforma o balance personal
}

// ✅ MODIFICADO: Convertir TimeFilter a string para mostrar
const getDisplayRange = (timeFilter: TimeFilter): string => {
  switch (timeFilter) {
    case "day":
      return "día"
    case "week":
      return "semana"
    case "month":
      return "mes"
    default:
      return "mes"
  }
}

const UsersTotalsCards = ({
  timeFilter,
  financialData,
  loading,
  error,
  isAdmin = false,
}: UsersTotalsCardsProps) => {
  // ✅ REMOVIDO: const { data, loading, error, refetch, isConnected } = useFinancialStats(isAdmin)
  // ✅ NUEVO: Usar financialData desde props
  const data = financialData

  // Formatear números con moneda
  const formatCurrency = (amount: number, currency: string = "€") => {
    return `${currency}${amount.toFixed(2)}`
  }

  // Determinar icono y color de tendencia
  const getTrendDisplay = (percentage: number) => {
    const Icon = percentage >= 0 ? ArrowUp : ArrowDown
    const color = percentage >= 0 ? "#61AA12" : "#EF4444"

    return {
      Icon,
      color,
      text: `${Math.abs(percentage).toFixed(1)}%`,
    }
  }

  const ingresosTrend = getTrendDisplay(data?.porcentajeCambioIngresos || 0)
  const comisionesTrend = getTrendDisplay(data?.porcentajeCambioComisiones || 0)

  // Debug para verificar datos recibidos
  React.useEffect(() => {
    console.log("💰 UsersTotalsCards - Props recibidas:", {
      timeFilter,
      loading,
      error,
      ingresos: data?.ingresosTotales,
      comisiones: data?.comisionesPagadas,
      isAdmin,
    })
  }, [timeFilter, loading, error, data, isAdmin])

  if (loading) {
    return (
      <Card className="w-full max-w-sm lg:h-130 flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando datos financieros...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm lg:h-130 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="text-center">
            <p className="text-red-500 mb-2 text-sm">{error}</p>
            <p className="text-xs text-muted-foreground">
              Error cargando datos para {getDisplayRange(timeFilter)}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm h-full min-h-[400px] lg:min-h-[500px] flex flex-col justify-center items-center lg:p-3 p-10">
      {/* ✅ NUEVO: Indicador del filtro activo */}
      <div className="w-full mb-4 text-center">
        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
          {getDisplayRange(timeFilter)}
        </span>
      </div>

      <div className="flex lg:flex-col lg:p-4 lg:gap-y-24 flex-row gap-x-12">
        {/* Primer bloque - Ingresos totales */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-tertiary mb-3">
            {isAdmin ? "Ingresos plataforma" : "Ingresos totales"}
          </h1>
          <p className="text-4xl font-semibold text-center">
            {formatCurrency(data?.ingresosTotales || 0, data?.moneda)}
          </p>
          <div
            className="flex items-center gap-x-1 text-sm mt-1"
            style={{ color: ingresosTrend.color }}
          >
            <ingresosTrend.Icon className="w-4 h-4" />
            <p className="text-center">{ingresosTrend.text}</p>
          </div>
        </div>

        {/* Segundo bloque - Comisiones pagadas */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-tertiary mb-3">
            {isAdmin ? "Comisiones totales" : "Comisiones pagadas"}
          </h1>
          <p className="text-4xl font-semibold text-center">
            {formatCurrency(data?.comisionesPagadas || 0, data?.moneda)}
          </p>
          <div
            className="flex items-center gap-x-1 text-sm mt-1"
            style={{ color: comisionesTrend.color }}
          >
            <comisionesTrend.Icon className="w-4 h-4" />
            <p>{comisionesTrend.text}</p>
          </div>
        </div>
      </div>

      {/* ✅ DEBUG: Mostrar estado actual */}
      {process.env.NODE_ENV === "development" && (
        <div className="w-full mt-4 p-2 bg-green-50 rounded text-xs">
          <strong>DEBUG UsersTotalsCards:</strong> Filtro: {timeFilter} |
          Ingresos: €{data?.ingresosTotales || 0} | Loading:{" "}
          {loading ? "Sí" : "No"} | Error: {error || "Ninguno"}
        </div>
      )}
    </Card>
  )
}

export default UsersTotalsCards
