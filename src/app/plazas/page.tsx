import ChartBarHorizontalCity from "@/features/plazas/components/GraphicsCity"
import TotalUsersGraphPlazas from "@/features/plazas/components/GraphicsPlazas"
import ChartBarHorizontal from "@/features/plazas/components/GraphicsPrice"
import UsersTablePlazas from "@/features/plazas/components/TablePlazas"
import WelcomePlazas from "@/features/plazas/components/WelcomePlazas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const PagePlazas = () => {
  return (
    <AppSidebarDashboard>
      <div className="mt-2">
        <WelcomePlazas />
        <div className="mt-5">
          <TotalUsersGraphPlazas />
        </div>
        <div className="flex flex-col lg:flex-row gap-4 mt-5">
          <div className="w-full md:w-1/2">
            <ChartBarHorizontal />
          </div>
          <div className="w-full md:w-1/2">
            <ChartBarHorizontalCity />
          </div>
        </div>
        <div className="mt-5">
          <UsersTablePlazas />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PagePlazas
