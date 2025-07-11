import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import MetricsCardsList from "@/features/users/components/MetricsCardsList"
import TotalUsersGraph from "@/features/users/components/TotalUsersGraph"
import UsersTable from "@/features/users/components/UsersTable"
import WelcomeUsers from "@/features/users/components/WelcomeUsers"

const UsersPage = () => {
  return (
    <AppSidebarDashboard>
      <div className="mt-7">
        <WelcomeUsers />
      </div>
      <div className="mt-5">
        <MetricsCardsList />
      </div>

      <div className="mt-5 flex-1/3">
        <TotalUsersGraph />
      </div>
      <div className="mt-5">
        <UsersTable />
      </div>
    </AppSidebarDashboard>
  )
}

export default UsersPage
