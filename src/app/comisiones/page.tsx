import Comisiones from "@/features/comisiones/components/Comisiones"
import WalletComponent from "@/features/comisiones/components/Wallet"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const ComisionesPage = () => {
  return (
    <AppSidebarDashboard>
      <div>
        <div>
          <Comisiones />
        </div>
        <div className="mt-4">
         <WalletComponent/>
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default ComisionesPage
