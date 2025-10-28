export interface ConfiguracionComisiones {
  stripePorcentaje: number
  stripeFijoEuros: number
  comisionAdminPorcentaje: number
  minimoRetiroEuros: number
}

export interface ActualizarComisionesPayload {
  stripePorcentaje?: number
  stripeFijoEuros?: number
  comisionAdminPorcentaje?: number
  minimoRetiroEuros?: number
}

export interface ComisionesResponse {
  success: boolean
  data: ConfiguracionComisiones
  message?: string
}
