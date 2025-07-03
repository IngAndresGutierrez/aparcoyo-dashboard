import { ChartAreaInteractive } from "@/features/home/components/Graphics"
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
    </div>
  )
}

export default Homepage
