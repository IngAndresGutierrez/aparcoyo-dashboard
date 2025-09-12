"use client"

import { useState } from "react"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import MetricsCardsList from "@/features/users/components/MetricsCardsList"
import TotalUsersGraph from "@/features/users/components/TotalUsersGraph"
import UsersTable from "@/features/users/components/UsersTable"
import WelcomeUsers from "@/features/users/components/WelcomeUsers"
import { RangoEstadisticas } from "@/features/plazas/types/range"
import { UsuarioTabla } from "@/features/users/types/table"

const UsersPage = () => {
  const [rango, setRango] = useState<RangoEstadisticas>("mes")
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioTabla[]>([])
  const [searchTerm] = useState("")
  const [estadoFilter] = useState<
    "activo" | "inactivo" | "suspendido" | undefined
  >(undefined)

  const handleRangoChange = (newRango: RangoEstadisticas) => {
    console.log(`📊 Cambio de período: ${rango} → ${newRango}`)
    setRango(newRango)
  }

  const handleUsuariosChange = (usuarios: UsuarioTabla[]) => {
    console.log("📊 Usuarios filtrados recibidos:", usuarios.length)
    setUsuariosFiltrados(usuarios)
  }

  return (
    <AppSidebarDashboard>
      <div className="mt-7">
        <WelcomeUsers
          rango={rango}
          onRangoChange={handleRangoChange}
          onUsuariosChange={handleUsuariosChange}
        />
      </div>

      {/* MÉTRICAS - Solo con hook dinámico */}
      <div className="mt-5">
        <MetricsCardsList
          rango={rango}
          usuariosFiltrados={usuariosFiltrados}
        />
      </div>

      {/* GRÁFICO - Solo con hook dinámico */}
      <div className="mt-5 flex-1/3">
        <TotalUsersGraph
          rango={rango}
          usuariosFiltrados={usuariosFiltrados}
        />
      </div>

      <div className="mt-5">
        <UsersTable
          usuarios={usuariosFiltrados}
          searchTerm={searchTerm}
          estadoFilter={estadoFilter}
        />
      </div>
    </AppSidebarDashboard>
  )
}

export default UsersPage
