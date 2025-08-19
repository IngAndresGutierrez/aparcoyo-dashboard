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
import React, { useState } from "react"
import { usePlatformStats } from "../../hooks/useTransaction"

// Opciones de período
const periodOptions = [
  {
    value: "daily",
    label: "Últimos 7 días",
    icon: "/home/calendar.svg",
  },
  {
    value: "weekly",
    label: "Últimas 4 semanas",
    icon: "/home/calendar.svg",
  },
  {
    value: "monthly",
    label: "Últimos 3 meses",
    icon: "/home/calendar.svg",
  },
]

const WelcomeTransactions = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const { loading, transactions, fetchStatsByPeriod } = usePlatformStats()

  // Manejar cambio de período
  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period)
    await fetchStatsByPeriod(period as "daily" | "weekly" | "monthly")
  }

  // Manejar descarga de reporte
  const handleDownloadReport = () => {
    if (!transactions || transactions.length === 0) {
      alert("No hay datos para descargar")
      return
    }

    // Crear CSV con los datos
    const headers = ["Factura", "Importe", "Fecha", "Estado", "Cliente", "Tipo"]
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [
          `"${t.factura}"`,
          t.importe,
          `"${t.fecha}"`,
          `"${t.estado}"`,
          `"${t.cliente}"`,
          `"${t.tipo}"`,
        ].join(",")
      ),
    ].join("\n")

    // Descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `transacciones_${selectedPeriod}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Transacciones</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* Select de período */}
        <Select
          value={selectedPeriod}
          onValueChange={handlePeriodChange}
          disabled={loading}
        >
          <SelectTrigger className="w-46 h-9 rounded-full">
            <Image
              src="/home/calendar.svg"
              alt="calendar"
              width={20}
              height={20}
            />
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                <div className="flex items-center gap-2">{option.label}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón de descarga */}
        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
          onClick={handleDownloadReport}
          disabled={loading || !transactions.length}
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

export default WelcomeTransactions
