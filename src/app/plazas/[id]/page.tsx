// app/plazas/[id]/page.tsx - Tu PageEditPlazas con Grid Layout
"use client"

import { useParams } from "next/navigation"
import PlazaDetails from "@/features/edit-plazas/components/DetailPlaza"
import PlazaHeader from "@/features/edit-plazas/components/HeaderPlazas"
import PlazaPhotos from "@/features/edit-plazas/components/PhotosPlaza"
import PlazaReservationsTable from "@/features/edit-plazas/components/ReservationTable/columns"
import PlazaReviews from "@/features/edit-plazas/components/ReseñasPlazas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

const PageEditPlazas = () => {
  // ✅ Obtener el ID de la plaza desde la URL
  const params = useParams()
  const plazaId = params.id as string

  return (
    <AppSidebarDashboard>
      <div className="min-h-screen">
        {/* Header que ocupa todo el ancho */}
        <PlazaHeader plazaId={plazaId} />

        {/* Contenido principal con grid de 2 columnas */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <PlazaDetails plazaId={plazaId} />
              <PlazaPhotos plazaId={plazaId} />
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <PlazaReviews plazaId={plazaId} />
            </div>
          </div>

          {/* Tabla de reservas debajo del grid */}
          <div className="mt-6">
            <PlazaReservationsTable plazaId={plazaId} />
          </div>
        </div>
      </div>
    </AppSidebarDashboard>
  )
}

export default PageEditPlazas
