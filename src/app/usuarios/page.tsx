"use client"

import { useState } from "react"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import MetricsCardsList from "@/features/users/components/MetricsCardsList"
import TotalUsersGraph from "@/features/users/components/TotalUsersGraph"
import UsersTable from "@/features/users/components/UsersTable"
import WelcomeUsers from "@/features/users/components/WelcomeUsers"
import { RangoEstadisticas } from "@/features/plazas/types/range"

// Importar el tipo (ajusta la ruta según tu estructura)

const UsersPage = () => {
  // ESTADO CENTRALIZADO - controla toda la página
  const [rango, setRango] = useState<RangoEstadisticas>("mes")

  // MANEJADOR DEL CAMBIO DE RANGO
  const handleRangoChange = (newRango: RangoEstadisticas) => {
    console.log(`📊 Cambio de período: ${rango} → ${newRango}`)
    setRango(newRango)
  }

  return (
    <AppSidebarDashboard>
      {/* HEADER CON SELECT DINÁMICO */}
      <div className="mt-7">
        <WelcomeUsers
          rango={rango}
          onRangoChange={handleRangoChange}
        />
      </div>

      {/* MÉTRICAS - SE ACTUALIZA AUTOMÁTICAMENTE */}
      <div className="mt-5">
        <MetricsCardsList rango={rango} />
      </div>

      {/* GRÁFICO - SE ACTUALIZA AUTOMÁTICAMENTE */}
      <div className="mt-5 flex-1/3">
        <TotalUsersGraph rango={rango} />
      </div>

      {/* TABLA - SE ACTUALIZA AUTOMÁTICAMENTE */}
      <div className="mt-5">
        <UsersTable />
      </div>
    </AppSidebarDashboard>
  )
}

export default UsersPage
