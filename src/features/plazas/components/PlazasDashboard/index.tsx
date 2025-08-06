// PlazasHeader.tsx - Actualizar el componente
"use client"

import React, { useState } from "react"
import WelcomePlazas from "../WelcomePlazas"


type RangoType = "dia" | "semana" | "mes"

interface PlazasHeaderProps {
  onRangeChange: (range: RangoType) => void
}

const PlazasHeader = ({ onRangeChange }: PlazasHeaderProps) => {
  const [selectedRange, setSelectedRange] = useState<RangoType>("mes")

  const handleRangeChange = (range: RangoType) => {
    console.log("🎯 PlazasHeader - Cambiando rango a:", range)
    setSelectedRange(range)
    onRangeChange(range) // ✅ Pasar al componente padre
  }

  return (
    <WelcomePlazas 
      selectedRange={selectedRange} 
      onRangeChange={handleRangeChange} 
    />
  )
}

export default PlazasHeader