import Image from "next/image"
import React from "react"

const TotalIncome = () => {
  const cardTotals = [
    {
      title: "Ingresos totales",
      price: "€150.44",
      image: "/home/arrow-up.svg",
      percentage: "100%",
    },
    {
      title: "Comisiones pagadas",
      price: "€42.49",
      image: "/home/arrow-up.svg",
      percentage: "100%",
    },
  ]

  return (
    <div className="w-56 border h-100 rounded-xl shadow-xs flex flex-col gap-10 py-19">
      {cardTotals.map((card, index) => (
        <div
          key={index}
          className="flex flex-col justify-center items-center text-center gap-2"
        >
          <h1 className="text-sm text-tertiary font-semibold">{card.title}</h1>
          <p className="text-4xl font-bold text-primary">{card.price}</p>
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <Image
              src={card.image}
              alt="arrow"
              width={16}
              height={16}
            />
            <p className="text-sm text-[#61AA12]">{card.percentage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TotalIncome
