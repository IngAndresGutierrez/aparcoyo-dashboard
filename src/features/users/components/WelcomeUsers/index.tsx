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
import { Calendar } from "lucide-react"
import { RangoEstadisticas } from "../../types/graphic" // Ajusta la ruta según tu estructura

interface WelcomeUsersProps {
  rango: RangoEstadisticas
  onRangoChange: (rango: RangoEstadisticas) => void
}

// Opciones del select con sus labels
const rangoOptions = [
  { value: "dia" as const, label: "Último día", icon: "📅" },
  { value: "semana" as const, label: "Últimos 7 días", icon: "📅" },
  { value: "mes" as const, label: "Últimos 30 días", icon: "📅" },
] as const

const WelcomeUsers = ({ rango, onRangoChange }: WelcomeUsersProps) => {
  // Obtener el label actual basado en el rango seleccionado
  const currentRangoLabel =
    rangoOptions.find((option) => option.value === rango)?.label ||
    "Últimos 30 días"

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Usuarios</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* SELECT DINÁMICO CONECTADO */}
        <Select
          value={rango}
          onValueChange={onRangoChange}
        >
          <SelectTrigger className="w-46 h-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue placeholder="Seleccionar período">
                {currentRangoLabel}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {rangoOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* BOTÓN DE DESCARGA - COMO ESTABA ORIGINALMENTE */}
        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
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

export default WelcomeUsers
