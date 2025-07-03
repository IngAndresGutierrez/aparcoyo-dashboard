import { ChartAreaInteractive } from "@/features/home/components/Graphics"
import UsersTotalsCards from "@/features/home/components/Totals"
import Welcome from "@/features/home/components/Welcome"

const Homepage = () => {
  return (
    <div className="">
      <Welcome />
      <UsersTotalsCards />
      <ChartAreaInteractive/>
    </div>
  )
}

export default Homepage
