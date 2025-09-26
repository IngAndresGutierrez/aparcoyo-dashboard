"use client"

import { useState, useCallback } from "react"
import WelcomeTransactions from "@/features/transacciones/components/WelcomeTransactions"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import GraphTransactions from "@/features/transacciones/components/GraphicsTransactions"
import MetricsCardsListTransactions from "@/features/transacciones/components/MetricCardTransactions"
import UsersTableTransactions from "@/features/transacciones/components/TableTransactions"
import { Transaction } from "@/features/transacciones/types/transaction"

// Tipos para mantener consistencia
type PeriodType = "day" | "week" | "month"

const PageTransactions = () => {
  const [rango, setRango] = useState<PeriodType>("month")
  const [transaccionesFiltradas, setTransaccionesFiltradas] = useState<
    Transaction[]
  >([])

  const handleRangoChange = useCallback((newRango: PeriodType) => {
    setRango(newRango)
  }, [])

  const handleTransaccionesChange = useCallback(
    (transacciones: Transaction[]) => {
      setTransaccionesFiltradas(transacciones)
    },
    []
  )

  return (
    <AppSidebarDashboard>
      <div>
        <div className="mt-2">
          <WelcomeTransactions
            rango={rango}
            onRangoChange={handleRangoChange}
            onTransaccionesChange={handleTransaccionesChange}
          />
        </div>

        <div className="mt-5">
          <GraphTransactions
            rango={rango}
            transaccionesFiltradas={transaccionesFiltradas}
          />
        </div>

        <div className="mt-5">
          <MetricsCardsListTransactions
            rango={rango}
            transaccionesFiltradas={transaccionesFiltradas}
          />
        </div>

        <div className="mt-5">
          <UsersTableTransactions />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PageTransactions
