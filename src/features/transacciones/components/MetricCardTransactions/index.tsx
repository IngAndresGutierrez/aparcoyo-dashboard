

const cardsItems = [
  {
    title: "Pagos a propietarios",
    value: "€111.44",
    icon: "",
    percentage: "+10%",
  },
  {
    title: "Comisiones generadas",
    value: "€42.49",
    icon: "",
    percentage: "+10%",
  },
  {
    title: "Ingresos netos",
    value: "€42.49",
    icon: "",
    percentage: "-10%",
  },
]

const MetricsCardsListTransactions = () => {
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
        <div
          className={`text-sm font-medium md:ml-16 lg:ml-1 ${
            item.percentage.startsWith("-") ? "text-red-500" : "text-green-500"
          }`}
        >
          {item.percentage}
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

export default MetricsCardsListTransactions
