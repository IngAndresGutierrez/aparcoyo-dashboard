import MetricCard from "@/features/shared/components/MetricCard"

const cardsItems = [
  {
    title: "Usuarios totales",
    value: "150",
    icon: "/home/arrow-up.svg",
    percentage: "+100%",
  },
  {
    title: "Plazas totales",
    value: "200",
    icon: "/home/arrow-up.svg",
    percentage: "+25%",
  },
  {
    title: "Plazas con reserva activa",
    value: "20",
    icon: "/home/arrow-down.svg",
    percentage: "-10%",
  },
  {
    title: "Reservas totales",
    value: "50",
    icon: "/home/arrow-down.svg",
    percentage: "-8%",
  },
]

const MetricsCardsListHome = () => {
  const renderCards = cardsItems.map((item, index) => {
    return (
      <MetricCard
        key={index}
        title={item.title}
        value={item.value}
        percentage={item.percentage}
      />
    )
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {renderCards}
    </div>
  )
}

export default MetricsCardsListHome
