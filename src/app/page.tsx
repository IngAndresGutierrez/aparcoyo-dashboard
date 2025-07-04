import { ChartAreaInteractive } from "@/features/home/components/Graphics"
import TableReports from "@/features/home/components/Reports"
import TotalIncome from "@/features/home/components/TotalIncome"
import UsersTotalsCards from "@/features/home/components/Totals"
import Welcome from "@/features/home/components/Welcome"

const Homepage = () => {
  return (
    <div className="">
      <Welcome />
      <UsersTotalsCards />
      <ChartAreaInteractive />
      <div className="flex -mt-100 ml-192">
        <TotalIncome />
      </div>
      <div className="flex justify-center items-center w-240 border rounded-xl ml-9 mt-8 p-4">
        <TableReports />
      </div>
    </div>
  )
}

export default Homepage
