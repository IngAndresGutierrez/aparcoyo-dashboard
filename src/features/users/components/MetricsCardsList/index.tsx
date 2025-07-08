import MetricCard from "@/features/shared/components/MetricCard"

const cardsItems = [
  {
    title: "Total Users",
    value: "100",
    icon: "",
    percentage: "10%",
  },
  {
    title: "Total Users",
    value: "100",
    icon: "",
    percentage: "10%",
  },
  {
    title: "Total Users",
    value: "100",
    icon: "",
    percentage: "10%",
  },
]

const MetricsCardsList = () => {
  const renderCards = cardsItems.map((item, index) => {
    return (
      <MetricCard
        key={index}
        title={item.title}
        value={item.value}
        icon={item.icon}
        percentage={item.percentage}
      />
    )
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderCards}
    </div>
  )
}

export default MetricsCardsList
