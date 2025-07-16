import WelcomeTransactions from "@/features/transacciones/components/WelcomeTransactions"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import GraphTransactions from "@/features/transacciones/components/GraphicsTransactions"
import MetricsCardsListTransactions from "@/features/transacciones/components/MetricCardTransactions"
import UsersTableTransactions from "@/features/transacciones/components/TableTransactions"

const pageTransactions = () => {
  return (
    <AppSidebarDashboard>
      <div>
        <div className="mt-2">
          <WelcomeTransactions />
        </div>
        <div className="mt-5">
            <GraphTransactions/>
        </div>
        <div className="mt-5">
            <MetricsCardsListTransactions/>
        </div>
        <div className="mt-5">
            <UsersTableTransactions/>
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default pageTransactions
