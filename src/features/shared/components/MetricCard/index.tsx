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
  icon,
  percentage,
}: {
  title: string
  value: string
  icon: string
  percentage: string
}) => {
  return (
    <Card className="w-full max-w-sm rounded-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>{value}</CardContent>
    </Card>
  )
}

export default MetricCard
