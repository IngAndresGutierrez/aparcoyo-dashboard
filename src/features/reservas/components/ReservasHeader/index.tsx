"use client"

import React, { useState } from "react"
import WelcomeReservas from "../WecomeReservas"


// Tipo para los rangos que espera el backend
type RangoType = "dia" | "semana" | "mes"

interface ReservasHeaderProps {
  onRangeChange: (range: RangoType) => void
}

const ReservasHeader = ({ onRangeChange }: ReservasHeaderProps) => {
  // 🎯 Estado central que controla todas las gráficas de reservas
  const [selectedRange, setSelectedRange] = useState<RangoType>("mes")

  const handleRangeChange = (range: RangoType) => {
    console.log("🎯 ReservasHeader - Cambiando rango a:", range)
    setSelectedRange(range)
    onRangeChange(range) // Pasar al componente padre
  }

  return (
    <WelcomeReservas 
      selectedRange={selectedRange} 
      onRangeChange={handleRangeChange} 
    />
  )
}

export default ReservasHeader