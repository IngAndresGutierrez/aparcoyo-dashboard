"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Image from "next/image"
import React from "react"
import { TimeFilter, useMetrics } from "../../hooks/useMetrics"

// Opciones del selector con labels amigables
const timeFilterOptions = [
  {
    value: "day" as TimeFilter,
    label: "Último día",
    icon: "/home/calendar.svg",
  },
  {
    value: "week" as TimeFilter,
    label: "Última semana",
    icon: "/home/calendar.svg",
  },
  {
    value: "month" as TimeFilter,
    label: "Últimos 30 días",
    icon: "/home/calendar.svg",
  },
]

const Welcome = () => {
  const { timeFilter, setTimeFilter, loading, metrics } = useMetrics()

  // Obtener el label actual basado en el filtro seleccionado
  const getCurrentLabel = () => {
    const option = timeFilterOptions.find((opt) => opt.value === timeFilter)
    return option?.label || "Últimos 30 días"
  }

  const handleDownloadReport = () => {
    // Aquí puedes implementar la lógica de descarga
    console.log("Descargando reporte para:", timeFilter)
    console.log("Datos actuales:", metrics)
    // Ejemplo: generar CSV, PDF, etc.
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Bienvenida, Kate</h1>

      <div className="flex flex-row gap-3 mt-4">
        <Select
          value={timeFilter}
          onValueChange={(value: TimeFilter) => setTimeFilter(value)}
        >
          <SelectTrigger className="w-48 h-9 rounded-full border border-border">
            <div className="flex items-center gap-2">
              <SelectValue placeholder={getCurrentLabel()} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={option.icon}
                    alt="calendar"
                    width={16}
                    height={16}
                  />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
          onClick={handleDownloadReport}
          disabled={loading}
        >
          <Image
            src="/home/file-download-02.svg"
            alt="download"
            width={20}
            height={20}
          />
          {loading ? "Cargando..." : "Descargar reporte"}
        </Button>
      </div>

      {/* Opcional: Mostrar loading state o preview de los datos */}
      {loading && (
        <div className="mt-4 text-sm text-muted-foreground">
          Cargando datos para {getCurrentLabel().toLowerCase()}...
        </div>
      )}

      {/* Debug: Mostrar valores actuales (opcional, remover en producción) */}
    </div>
  )
}

export default Welcome
