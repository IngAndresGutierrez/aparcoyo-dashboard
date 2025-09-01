"use client"

import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useFinancialStats } from "../../hooks/useFinanzas"

interface UsersTotalsCardsProps {
  isAdmin?: boolean // Para determinar si usar estadísticas de plataforma o balance personal
}

const UsersTotalsCards = ({ isAdmin = false }: UsersTotalsCardsProps) => {
  const { data, loading, error, refetch, isConnected } =
    useFinancialStats(isAdmin)

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

  if (loading) {
    return (
      <Card className="w-full max-w-sm lg:h-130 flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </Card>
    )
  }

  if (error || !isConnected) {
    return (
      <Card className="w-full max-w-sm lg:h-130 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="text-center">
            <p className="text-red-500 mb-2 text-sm">
              {error || "Error de conexión"}
            </p>
            <button
              onClick={refetch}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm h-full min-h-[400px] lg:min-h-[500px] flex justify-center items-center p-10">
      {" "}
      {/* ← Cambiar por esto */}
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
    </Card>
  )
}

export default UsersTotalsCards
