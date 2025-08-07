"use client"

import { useState } from "react"
import TotalUsersGraphReservas from "@/features/reservas/components/GraphicReservas"
import MetricsCardsListReservas from "@/features/reservas/components/MetricCardReservas"
import ReservationsChartCity from "@/features/reservas/components/ReservationCity"
import ReservationsChart from "@/features/reservas/components/Reservations"
import ReservationsTable from "@/features/reservas/components/TableReservations"
import WelcomeReservas from "@/features/reservas/components/WecomeReservas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

type RangoType = "dia" | "semana" | "mes"

const PageReservas = () => {
  // 🎯 Estado central que controla TODAS las gráficas de reservas
  const [selectedRange, setSelectedRange] = useState<RangoType>("mes")

  console.log("📄 PageReservas - Rango actual:", selectedRange)

  return (
    <AppSidebarDashboard>
      <div className="mt-2">
        {/* Header con select que controla todo */}
        <WelcomeReservas
          selectedRange={selectedRange}
          onRangeChange={(newRange) => {
            console.log("📄 Página recibió cambio de rango:", newRange)
            setSelectedRange(newRange)
          }}
        />
      </div>

      <div className="mt-5">
        {/* Gráfica principal - CONECTADA */}
        <TotalUsersGraphReservas rango={selectedRange} />
      </div>

      <div className="mt-5">
        {/* Métricas - puedes conectar si también usan el rango */}
        <MetricsCardsListReservas />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 md:grid-cols-2">
        {/* Gráficas de barras - CONECTADAS */}
        <ReservationsChart rango={selectedRange} />
        <ReservationsChartCity rango={selectedRange} />
      </div>

      <div className="mt-5">
        {/* Tabla - ya está conectada independientemente */}
        <ReservationsTable />
      </div>
    </AppSidebarDashboard>
  )
}

export default PageReservas
