import { ArrowUp, ArrowDown } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MetricCard = ({
  title,
  value,
  percentage,
}: {
  title: string
  value: string
  percentage: string
}) => {
  const isPositive = percentage.startsWith("+")
  const percentageValue = percentage.replace(/^[+-]/, "") // quita + o -
  const percentageColor = isPositive ? "text-[#61AA12]" : "text-[#D92D20]"
  const Icon = isPositive ? ArrowUp : ArrowDown

  return (
    <Card className="lg:w-full md:w-60 max-w-sm rounded-xl">
      <CardHeader className="relative">
        <CardTitle className="text-tertiary font-semibold">{title}</CardTitle>
        <CardDescription
          className={`absolute mt-17 ml-22 lg:mt-14 lg:ml-38 left-0 flex items-center  text-sm ${percentageColor}`}
        >
          <Icon className={`w-4 h-4 mr-1 ${percentageColor}`} />
          {percentageValue}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  )
}

export default MetricCard
