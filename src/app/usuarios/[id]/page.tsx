import UserCredits from "@/features/edit-user/components/UserCredit"
import UserDetails from "@/features/edit-user/components/UserDetailCard"
import UserVehicle from "@/features/edit-user/components/UserDetailVehicle"
import UserHeader from "@/features/edit-user/components/UserDetailView"
import UserPlazas from "@/features/edit-user/components/UserPlaza"
import UserReservas from "@/features/edit-user/components/UserReservas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

interface UserPageProps {
  params: Promise<{ id: string }> // ✅ Ahora es una Promise
}

const page = async ({ params }: UserPageProps) => {
  // ✅ Usar await para resolver los params
  const { id } = await params

  return (
    <AppSidebarDashboard>
      <div className="p-6 max-w-6xl mx-auto space-y-6 ml-10 -mt-4">
        {/* Header del usuario - queda arriba solo */}
        <div className=" -mt-16">
          <UserHeader userId={id} />
        </div>

        {/* Grid principal: columna izquierda (detalles) y columna derecha (plazas) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          {/* Columna izquierda: Detalles, Vehículos, Créditos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del usuario */}
            <UserDetails userId={id} />

            {/* Grid interno: Vehículos y Créditos lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserVehicle userId={id} />
              <UserCredits userId={id} />
            </div>
          </div>

          {/* Columna derecha: Plazas publicadas */}
          <div className="lg:col-span-1">
            <UserPlazas userId={id} />
          </div>
        </div>
      </div>

      {/* Tabla de reservas - abajo de todo, separada */}
      <div className="p-6 max-w-6xl mx-auto ml-10">
        <UserReservas userId={id} />
      </div>
    </AppSidebarDashboard>
  )
}

export default page
