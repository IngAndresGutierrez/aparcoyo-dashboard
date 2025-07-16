import { Button } from "@/components/ui/button"
import Image from "next/image"
import React from "react"

const WelcomePlazas = () => {
  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Plazas</h1>

      <div className="flex flex-row gap-3 mt-4 ">
        <Button
          variant="outline"
          className="w-46 h-9 rounded-full"
        >
          <Image
            src="/home/calendar.svg"
            alt="calendar"
            width={20}
            height={20}
          />
          Últimos 30 días
          <Image
            src="/home/arrow.svg"
            alt="arrow"
            width={20}
            height={20}
          />
        </Button>
        <Button
          variant="outline"
          className="w-46 h-9 rounded-full"
        >
          <Image
            src="/home/file-download-02.svg"
            alt="calendar"
            width={20}
            height={20}
          />
          Descargar reporte
        </Button>
      </div>
    </div>
  )
}

export default WelcomePlazas
