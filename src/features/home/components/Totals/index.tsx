import { Card } from "@/components/ui/card"
import { ArrowUp } from "lucide-react"

const UsersTotalsCards = () => {
  return (
    <Card className="w-full max-w-sm lg:h-130 flex justify-center items-center">
      <div className="flex lg:flex-col lg:p-4 lg:gap-y-24 flex-row gap-x-12">
        {/* Primer bloque */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-tertiary mb-3">
            Ingresos totales
          </h1>
          <p className="text-4xl font-semibold text-center ">€150.44</p>
          <div className="flex items-center gap-x-1 text-[#61AA12] text-sm mt-1">
            <ArrowUp className="w-4 h-4" />
            <p className="text-center">100%</p>
          </div>
        </div>

        {/* Segundo bloque (duplicado) */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-tertiary mb-3">
            Comisiones pagadas
          </h1>
          <p className="text-4xl font-semibold text-center ">€150.44</p>
          <div className="flex items-center gap-x-1 text-[#61AA12] text-sm mt-1">
            <ArrowUp className="w-4 h-4" />
            <p>100%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default UsersTotalsCards
