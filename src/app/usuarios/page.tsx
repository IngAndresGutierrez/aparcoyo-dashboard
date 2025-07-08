import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import MetricsCardsList from "@/features/users/components/MetricsCardsList"
import TotalUsersGraph from "@/features/users/components/TotalUsersGraph"
import UsersTable from "@/features/users/components/UsersTable"

const UsersPage = () => {
  return (
    <AppSidebarDashboard>
      <h1>Users</h1>
      <MetricsCardsList />
      <TotalUsersGraph />
      <UsersTable />
    </AppSidebarDashboard>
  )
}

export default UsersPage
