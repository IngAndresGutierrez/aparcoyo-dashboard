import UserCredits from "@/features/edit-user/components/UserCredit"
import UserDetails from "@/features/edit-user/components/UserDetailCard"
// import UserVehicle from "@/features/edit-user/components/UserDetailVehicle"
import UserHeader from "@/features/edit-user/components/UserDetailView"
import UserPlazas from "@/features/edit-user/components/UserPlaza"
import UserReservas from "@/features/edit-user/components/UserReservas"
import AppSidebarDashboard from "@/features/shared/components/AppSidebarDashboard"

interface UserPageProps {
  params: { id: string }
}

const page = ({ params }: UserPageProps) => {
  return (
    <AppSidebarDashboard>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <UserHeader userId={params.id} />
        <UserDetails userId={params.id} /> {/* ← Usar params.id, no userId */}
        {/* <UserVehicle userId={params.id} /> */}
        <UserCredits userId={params.id} />
        <UserPlazas userId={params.id} />
      </div>
      <div>
        <UserReservas userId={params.id}/>
      </div>
    </AppSidebarDashboard>
  )
}

export default page
