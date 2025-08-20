"use client"

import { useState } from "react"
import MetricCardReports from "@/features/reportes/components/MetricCardReports"
import UsersTableReports from "@/features/reportes/components/TableReports"
import WelcomeReports from "@/features/reportes/components/WelcomeReports"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const PageReports = () => {
  const [currentFilter, setCurrentFilter] = useState("mes")

  const handleFilterChange = (filtro: string) => {
    setCurrentFilter(filtro)
  }

  return (
    <AppSidebarDashboard>
      <div>
        <div className="mt-2">
          <WelcomeReports onFilterChange={handleFilterChange} />
        </div>
        <div className="mt-5">
          <MetricCardReports filtroFecha={currentFilter} />
        </div>
        <div className="mt-5">
          <UsersTableReports filtroFecha={currentFilter} />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PageReports
