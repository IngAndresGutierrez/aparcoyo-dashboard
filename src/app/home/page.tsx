import GraphicsHome from "@/features/home/components/Graphics"
import MetricsCardsListHome from "@/features/home/components/MetricCardHome"
import TableReports from "@/features/home/components/Reports"
import UsersTotalsCards from "@/features/home/components/Totals"
import Welcome from "@/features/home/components/Welcome"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const Homepage = () => {
  return (
    <AppSidebarDashboard>
      <div className="flex flex-col gap-1 p-1">
        {/* Welcome Section */}
        <Welcome />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
          {/* Primera fila - 4 cards métricas */}
          <div className="col-span-1 lg:col-span-4 mt-5">
            <MetricsCardsListHome />
          </div>

          {/* Segunda fila */}
          {/* Lado izquierdo - Gráfica ocupa 3 columnas en desktop, full width en mobile */}
          <div className="col-span-1 lg:col-span-3">
            <GraphicsHome />
          </div>

          {/* Lado derecho - Cards totales ocupan 1 columna en desktop, full width en mobile */}
          <div className="col-span-1 lg:col-span-1 lg:-ml-1">
            <UsersTotalsCards />
          </div>
        </div>

        {/* Table Reports Section */}
        <div className="w-full mt-5">
          <TableReports />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default Homepage