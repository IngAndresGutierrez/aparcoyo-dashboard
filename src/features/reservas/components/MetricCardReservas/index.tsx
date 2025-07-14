import { Card } from "@/components/ui/card"
import React from "react"

const MetricCardReservas = () => {
  const cards = [
    {
      title: "Publicado al menos una plaza",
      value: "100",
      icon: "", // podrías poner un componente si tienes uno
      percentage: "+100%",
    },
    {
      title: "Usuarios con reservas completadas",
      value: "100",
      icon: "",
      percentage: "-100%",
    },
  ]

  return (
    <div className="gap-4 grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="p-4 w-full h-29 relative"
        >
          {/* Porcentaje en esquina superior derecha */}
          <p
            className={`absolute top-2 right-2 text-sm mt-16 ${
              card.percentage.startsWith("-")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {card.percentage}
          </p>

          <h2 className="text-base font-semibold text-tertiary">
            {card.title}
          </h2>
          <p className="text-2xl font-bold -mt-3">{card.value}</p>
        </Card>
      ))}
    </div>
  )
}

export default MetricCardReservas
