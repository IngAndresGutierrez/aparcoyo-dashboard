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
    <Card className="lg:w-full md:w-60 max-w-sm rounded-xl h-33">
      <CardHeader className="pb-2">
        <CardTitle className="text-tertiary font-semibold">{title}</CardTitle>
        <CardDescription
          className={`flex items-center justify-end text-sm ${percentageColor} mt-1`}
        >
          <Icon className={`w-4 h-4 mr-1 ${percentageColor}`} />
          {percentageValue}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-2xl font-bold pt-0 lg:-mt-5 -mt-7">
        {value}
      </CardContent>
    </Card>
  )
}

export default MetricCard
