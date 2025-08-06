"use client"

import { useState } from "react"
import ChartBarHorizontalCity from "@/features/plazas/components/GraphicsCity"
import TotalUsersGraphPlazas from "@/features/plazas/components/GraphicsPlazas"
import ChartBarHorizontalType from "@/features/plazas/components/GraphicsPrice" // Asumiendo que este es el de tipos

import UsersTablePlazas from "@/features/plazas/components/TablePlazas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"
import PlazasHeader from "@/features/plazas/components/PlazasDashboard"

type RangoType = "dia" | "semana" | "mes"

const PagePlazas = () => {
  // 🎯 Estado central que controla TODAS las gráficas
  const [selectedRange, setSelectedRange] = useState<RangoType>("mes")

  console.log("📄 PagePlazas - Rango actual:", selectedRange)

  return (
    <AppSidebarDashboard>
      <div className="mt-2">
        {/* Header con select que controla todo */}
        <PlazasHeader
          onRangeChange={(newRange) => {
            console.log("📄 Página recibió cambio de rango:", newRange)
            setSelectedRange(newRange)
          }}
        />

        <div className="mt-5">
          {/* Gráfica principal que YA está conectada */}
          <TotalUsersGraphPlazas rango={selectedRange} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-5">
          <div className="w-full md:w-1/2">
            {/* Gráfica de tipos - CONECTADA */}
            <ChartBarHorizontalType rango={selectedRange} />
          </div>
          <div className="w-full md:w-1/2">
            {/* Gráfica de ciudades - CONECTADA */}
            <ChartBarHorizontalCity rango={selectedRange} />
          </div>
        </div>

        <div className="mt-5">
          {/* Tabla (si también necesita el rango, agregar prop) */}
          <UsersTablePlazas />
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PagePlazas
