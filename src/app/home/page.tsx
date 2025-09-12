"use client"

import React from "react"
import GraphicsHome from "@/features/home/components/Graphics"
import MetricsCardsListHome from "@/features/home/components/MetricCardHome"
import TableReports from "@/features/home/components/Reports"
import UsersTotalsCards from "@/features/home/components/Totals"
import Welcome from "@/features/home/components/Welcome"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import { useMetrics, TimeFilter } from "@/features/home/hooks/useMetrics"
import { useFinancialStats } from "@/features/home/hooks/useFinanzas"

// Tipado para los datos de métricas
interface MetricState {
  value: number
  loading: boolean
  error: string | null
}

interface MetricsData {
  users: MetricState
  plazas: MetricState
  activeReservas: MetricState
  totalReservas: MetricState
}

interface UseMetricsReturn {
  metrics: MetricsData
  loading: boolean
  error: string | null
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  refetch: () => Promise<void>
}

const Homepage: React.FC = () => {
  // ✅ FUENTE ÚNICA DE VERDAD - Solo un hook para métricas
  const metricsData: UseMetricsReturn = useMetrics()

  // ✅ Usar useFinancialStats SINCRONIZADO con el filtro de métricas
  const financialData = useFinancialStats(
    false, // isAdmin
    true, // autoFetch
    metricsData.timeFilter // ← CLAVE: usar el mismo filtro que métricas
  )

  // ✅ Función centralizada para cambiar filtro
  const handleTimeFilterChange = (filter: TimeFilter) => {
    console.log(
      `🏠 Homepage: Cambiando filtro global de ${metricsData.timeFilter} a ${filter}`
    )

    // Cambiar el filtro en metrics (que es la fuente principal)
    metricsData.setTimeFilter(filter)

    // Sincronizar el filtro financiero
    if (financialData.setTimeFilter) {
      financialData.setTimeFilter(filter)
    }
  }

  // Debug para monitorear sincronización
  React.useEffect(() => {
    console.log("🏠 Homepage - Estado centralizado:", {
      timeFilter: metricsData.timeFilter,
      metricsLoading: metricsData.loading,
      financialLoading: financialData.loading,
      users: metricsData.metrics.users.value,
      reservas: metricsData.metrics.totalReservas.value,
      ingresos: financialData.data?.ingresosTotales || 0,
      filtrosSincronizados: metricsData.timeFilter === financialData.timeFilter,
    })
  }, [
    metricsData.timeFilter,
    metricsData.loading,
    financialData.loading,
    metricsData.metrics,
    financialData.data,
    financialData.timeFilter,
  ])

  // ✅ Estado loading y error combinados
  const isLoading = metricsData.loading || financialData.loading
  const hasError = metricsData.error || financialData.error

  return (
    <AppSidebarDashboard>
      <div className="flex flex-col gap-1 p-1">
        {/* Welcome Section */}
        <Welcome
          timeFilter={metricsData.timeFilter}
          setTimeFilter={handleTimeFilterChange}
          metrics={metricsData.metrics}
          loading={isLoading}
          error={hasError}
          refetch={async () => {
            await metricsData.refetch()
            await financialData.refetch()
          }}
        />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
          {/* Primera fila - 4 cards métricas */}
          <div className="col-span-1 lg:col-span-4 mt-5">
            <MetricsCardsListHome
              key={`metrics-${metricsData.timeFilter}`}
              timeFilter={metricsData.timeFilter}
              setTimeFilter={handleTimeFilterChange}
              metrics={metricsData.metrics}
              loading={isLoading}
              error={hasError}
              refetch={async () => {
                await metricsData.refetch()
                await financialData.refetch()
              }}
            />
          </div>

          {/* Segunda fila */}
          {/* Lado izquierdo - Gráfica */}
          <div className="col-span-1 lg:col-span-3">
            <GraphicsHome
              timeFilter={metricsData.timeFilter}
              setTimeFilter={handleTimeFilterChange}
              financialData={financialData.data}
              metricsData={metricsData.metrics}
              loading={isLoading}
              error={hasError}
            />
          </div>

          {/* Lado derecho - Cards totales */}
          <div className="col-span-1 lg:col-span-1 lg:-ml-1">
            <UsersTotalsCards
              timeFilter={metricsData.timeFilter}
              setTimeFilter={handleTimeFilterChange}
              metrics={metricsData.metrics}
              financialData={financialData.data}
              loading={isLoading}
              error={hasError}
            />
          </div>
        </div>

        {/* Table Reports Section - SIN SINCRONIZACIÓN */}
        <div className="mt-5">
          <TableReports />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default Homepage
