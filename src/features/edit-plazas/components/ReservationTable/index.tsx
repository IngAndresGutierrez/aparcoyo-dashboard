// features/edit-plazas/components/PlazaReservationsHeader.tsx
"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"

interface PlazaReservationsHeaderProps {
  totalReservas?: number
  plazaId?: string
}

function PlazaReservationsHeader({
  totalReservas = 48,
  plazaId = "plaza-001",
}: PlazaReservationsHeaderProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {totalReservas} Reservas
        </CardTitle>

        {/* Debug info - remover en producción */}
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
          <strong>Debug Header:</strong> Plaza ID: {plazaId} | Total:{" "}
          {totalReservas}
        </div>
      </CardHeader>
    </Card>
  )
}

export default PlazaReservationsHeader
