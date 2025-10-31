// PlazasHeader.tsx - VERSIÓN FINAL CORREGIDA
"use client"

import WelcomePlazas from "../WelcomePlazas"

type RangoType = "dia" | "semana" | "mes"

interface PlazasHeaderProps {
  selectedRange: RangoType // 👈 1. AGREGAR esta línea
  onRangeChange: (range: RangoType) => void
}

const PlazasHeader = ({ selectedRange, onRangeChange }: PlazasHeaderProps) => {
  //                      👆 2. AGREGAR selectedRange aquí en la destructuración

  const handleRangeChange = (range: RangoType) => {
    console.log("🎯 PlazasHeader - Cambiando rango a:", range)
    onRangeChange(range) // ✅ Pasar al componente padre
  }

  return (
    <WelcomePlazas
      selectedRange={selectedRange} // ✅ Ahora sí existe la variable
      onRangeChange={handleRangeChange}
    />
  )
}

export default PlazasHeader
