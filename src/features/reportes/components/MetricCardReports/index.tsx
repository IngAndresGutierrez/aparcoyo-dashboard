const cardsItems = [
  {
    title: "Total reportes recibidos",
    value: "18",
    icon: "",
  },
  {
    title: "Reportes pendientes",
    value: "8",
    icon: "",
  },
  {
    title: "Reportes resueltos",
    value: "7",
    icon: "",
  },
]

const MetricCardReports = () => {
  const renderCards = cardsItems.map((item, index) => {
    return (
      <div
        key={index}
        className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
      >
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            {item.title}
          </h2>
          <p className="text-xl font-bold mt-2">{item.value}</p>
        </div>
      </div>
    )
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderCards}
    </div>
  )
}

export default MetricCardReports
