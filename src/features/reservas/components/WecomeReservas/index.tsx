"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import React from "react"

// Tipo para los rangos
type RangoType = "dia" | "semana" | "mes"

// Props que recibe el componente
interface WelcomeReservasProps {
  selectedRange: RangoType
  onRangeChange: (range: RangoType) => void
}

const WelcomeReservas = ({
  selectedRange,
  onRangeChange,
}: WelcomeReservasProps) => {
  // Mapeo de valores para mostrar texto amigable
  const rangeLabels = {
    dia: "Hoy",
    semana: "Últimos 7 días",
    mes: "Últimos 30 días",
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Reservas</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* Select conectado al estado padre */}
        <Select
          value={selectedRange}
          onValueChange={(value: RangoType) => {
            console.log("🔄 Cambiando rango de reservas a:", value)
            onRangeChange(value)
          }}
        >
          <SelectTrigger className="w-46 h-9 rounded-full ring-0 focus:ring-0 focus:ring-offset-0">
            <div className="flex items-center gap-2">
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <SelectValue>
                {rangeLabels[selectedRange]}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Hoy</SelectItem>
            <SelectItem value="semana">Últimos 7 días</SelectItem>
            <SelectItem value="mes">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón para descargar reporte */}
        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
          onClick={() => {
            console.log(`📄 Descargando reporte de reservas para rango: ${selectedRange}`)
            // Aquí puedes agregar la lógica de descarga
          }}
        >
          <Image
            src="/home/file-download-02.svg"
            alt="download"
            width={20}
            height={20}
          />
          Descargar reporte
        </Button>
      </div>
    </div>
  )
}

export default WelcomeReservas