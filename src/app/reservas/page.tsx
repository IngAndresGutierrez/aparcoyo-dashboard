import TotalUsersGraphReservas from "@/features/reservas/components/GraphicReservas"
import MetricsCardsListReservas from "@/features/reservas/components/MetricCardReservas"
import ReservationsChartCity from "@/features/reservas/components/ReservationCity"
import ReservationsChart from "@/features/reservas/components/Reservations"
import ReservationsTable from "@/features/reservas/components/TableReservations"
import WelcomeReservas from "@/features/reservas/components/WecomeReservas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const PageRservas = () => {
  return (
    <AppSidebarDashboard>
      <div className="mt-2">
        <WelcomeReservas />
      </div>
      <div className="mt-5">
        <TotalUsersGraphReservas/>
      </div>
      <div className="mt-5">
        <MetricsCardsListReservas/>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 md:grid-cols-2">
        <ReservationsChart/>
        <ReservationsChartCity/>
      </div>
      <div className="mt-5">
        <ReservationsTable/>
      </div>
    </AppSidebarDashboard>
  )
}

export default PageRservas
