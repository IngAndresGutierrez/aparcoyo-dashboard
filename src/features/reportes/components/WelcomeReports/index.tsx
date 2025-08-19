"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import React, { useState } from "react"

interface WelcomeReportsProps {
  onFilterChange: (filtro: string) => void
  loading?: boolean
}

const WelcomeReports: React.FC<WelcomeReportsProps> = ({
  onFilterChange,
  loading = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("mes")

  const filterOptions = [
    {
      value: "dia",
      label: "Último día",
      displayLabel: "Últimas 24 horas",
    },
    {
      value: "semana",
      label: "Última semana",
      displayLabel: "Últimos 7 días",
    },
    {
      value: "mes",
      label: "Último mes",
      displayLabel: "Últimos 30 días",
    },
  ]

  const handleFilterSelect = (value: string) => {
    setSelectedFilter(value)
    onFilterChange(value)
  }

  const getCurrentLabel = () => {
    const current = filterOptions.find(
      (option) => option.value === selectedFilter
    )
    return current?.displayLabel || "Últimos 30 días"
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Reportes</h1>

      <div className="flex flex-row gap-3 mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-46 h-9 rounded-full flex items-center gap-2"
              disabled={loading}
            >
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              {getCurrentLabel()}
              <Image
                src="/home/arrow.svg"
                alt="arrow"
                width={20}
                height={20}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48"
          >
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`flex items-center gap-2 p-3 ${
                  selectedFilter === option.value ? "bg-accent" : ""
                }`}
              >
                <Image
                  src="/home/calendar.svg"
                  alt="calendar"
                  width={16}
                  height={16}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.displayLabel}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="w-46 h-9 rounded-full flex items-center gap-2"
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

export default WelcomeReports
