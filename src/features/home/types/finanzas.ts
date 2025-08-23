// types/financial.ts
export interface EstadisticasFinancieras {
  ingresosTotales: {
    valor: number
    moneda: string
    porcentajeCambio: number
    tendencia: "up" | "down" | "neutral"
  }
  comisionesPagadas: {
    valor: number
    moneda: string
    porcentajeCambio: number
    tendencia: "up" | "down" | "neutral"
  }
  periodo: {
    desde: string
    hasta: string
    rango: "dia" | "semana" | "mes" | "año"
  }
}

export interface ApiFinancialResponse {
  success: boolean
  data: EstadisticasFinancieras
  message?: string
}