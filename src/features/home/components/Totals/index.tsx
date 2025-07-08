import Image from "next/image"

const UsersTotalsCards = () => {
  const cards = [
    {
      id: 1,
      tittle: "Usuarios totales",
      number: "1,402",
      image: "/home/arrow-up.svg",
      percentage: "100%",
      trend: "up",
    },
    {
      id: 2,
      tittle: "Usuarios nuevos este periodo",
      number: "14",
      image: "/home/arrow-up.svg",
      percentage: "100%",
      trend: "up",
    },
    {
      id: 3,
      tittle: "Plazas totales",
      number: "332",
      image: "/home/arrow-down.svg",
      percentage: "100%",
      trend: "down",
    },
    {
      id: 4,
      tittle: "Plazas con reserva activa",
      number: "24",
      image: "/home/arrow-down.svg",
      percentage: "100%",
      trend: "down",
    },
  ]

  return (
    <div className="flex gap-5 mt-8 ml-9">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-secondary-border rounded-xl p-4 w-56 h-26 flex flex-col gap-2 shadow-sm"
        >
          <p className="text-tertiary text-sm font-semibold">{card.tittle}</p>
          <p className="text-2xl font-bold text-gray-900">{card.number}</p>
          <div className="flex items-center gap-1">
            <Image className="ml-36 -mt-6"
              src={card.image}
              alt="trend arrow"
              width={12}
              height={12}
            />
            <span
              className={`text-sm font-medium -mt-6 ${
                card.trend === "up" ? "text-[#61AA12]" : "text-[#D92D20]"
              }`}
            >
              {card.percentage}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UsersTotalsCards
