import { useState } from "react"
import { walletService } from "../services/wallet-service"
import { DatosBancarios, RetiroRequest } from "../types/wallet"

export const useWallet = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ejecutar = async <T>(fn: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fn()
      return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Error en la operación")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getBancos: () => ejecutar(() => walletService.getBancos()),
    getDatosBancarios: () => ejecutar(() => walletService.getDatosBancarios()),
    configurarBanco: (datos: DatosBancarios) =>
      ejecutar(() => walletService.configurarBanco(datos)),
    retirar: (data: RetiroRequest) =>
      ejecutar(() => walletService.retirar(data)),
    getHistorialRetiros: () =>
      ejecutar(() => walletService.getHistorialRetiros()),
  }
}
