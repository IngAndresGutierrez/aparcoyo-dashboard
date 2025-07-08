import { ChartAreaInteractive } from "@/features/home/components/Graphics"
import TableReports from "@/features/home/components/Reports"
import TotalIncome from "@/features/home/components/TotalIncome"
import UsersTotalsCards from "@/features/home/components/Totals"
import Welcome from "@/features/home/components/Welcome"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const Homepage = () => {
  return (
    <>
      <AppSidebarDashboard>
        <div className="">
          <Welcome />
          <UsersTotalsCards />
          <ChartAreaInteractive />
          <div className="flex -mt-100 ml-192">
            <TotalIncome />
          </div>
          <div className="">
            <TableReports />
          </div>
        </div>
      </AppSidebarDashboard>
    </>
  )
}

export default Homepage
