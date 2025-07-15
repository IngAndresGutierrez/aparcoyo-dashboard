import MetricCardReports from "@/features/reportes/components/MetricCardReports"
import UsersTableReports from "@/features/reportes/components/TableReports"
import WelcomeReports from "@/features/reportes/components/WelcomeReports"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const PageReports = () => {
  return (
    <AppSidebarDashboard>
      <div>
        <div className="mt-2">
          <WelcomeReports />
        </div>
        <div className="mt-5">
            <MetricCardReports/>
        </div>
        <div className="mt-5">
            <UsersTableReports/>
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PageReports
