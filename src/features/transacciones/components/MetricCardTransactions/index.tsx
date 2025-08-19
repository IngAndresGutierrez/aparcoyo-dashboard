"use client"

import { usePlatformStats } from "../../hooks/useTransaction"

// Función helper para formatear moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

// Función helper para formatear porcentaje
const formatPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
}

// Datos de fallback mientras carga o si hay error
const fallbackCards = [
  {
    title: "Pagos a propietarios",
    value: "€111.44",
    percentage: "+10%",
  },
  {
    title: "Comisiones generadas",
    value: "€42.49",
    percentage: "+10%",
  },
  {
    title: "Ingresos netos",
    value: "€42.49",
    percentage: "-10%",
  },
]

const MetricsCardsListTransactions = () => {
  const { loading, error, statistics, refetch } = usePlatformStats({
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  })

  // Preparar datos de las cards
  let cardsData = fallbackCards

  if (statistics) {
    // Usar datos reales del API
    cardsData = [
      {
        title: "Pagos a propietarios",
        value: formatCurrency(statistics.pagosAPropietarios),
        percentage: formatPercentage(statistics.percentageChange),
      },
      {
        title: "Comisiones generadas",
        value: formatCurrency(statistics.comisionesGeneradas),
        percentage: formatPercentage(statistics.percentageChange),
      },
      {
        title: "Ingresos netos",
        value: formatCurrency(statistics.ingresosNetos),
        percentage: formatPercentage(statistics.percentageChange),
      },
    ]
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <div className="space-y-2">
              <div className="w-32 h-4 bg-muted animate-pulse rounded"></div>
              <div className="w-20 h-6 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const renderCards = cardsData.map((item, index) => {
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
    <div className="space-y-4">
      {/* Mostrar error si existe, pero de manera discreta */}
      {error && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
          <div className="text-sm text-orange-700">
            Usando datos de ejemplo - Error: {error}
          </div>
          <button
            onClick={refetch}
            className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderCards}
      </div>

      {/* Indicador de datos reales vs fallback */}
      <div className="text-xs text-muted-foreground text-center">
        {statistics ? (
          <span className="text-green-600"></span>
        ) : (
          <span className="text-orange-600">⚠️ Mostrando datos de ejemplo</span>
        )}
      </div>
    </div>
  )
}

export default MetricsCardsListTransactions
