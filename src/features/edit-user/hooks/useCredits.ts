// hooks/useCreditos.ts

import { useState, useEffect, useCallback } from "react"
import { creditosService } from "../services/credits-service"
import { BalanceResponse, HistorialResponse } from "../types/credits-edit"

// Hook para obtener balance de créditos
export const useBalance = (uuid: string, autoFetch: boolean = true) => {
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!uuid) return

    console.log(`🔄 useBalance - Obteniendo balance para usuario: ${uuid}`)

    try {
      setLoading(true)
      setError(null)
      const response = await creditosService.obtenerBalance(uuid)
      console.log(`✅ useBalance - Balance obtenido:`, response)
      setBalance(response)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      console.error(`❌ useBalance - Error:`, errorMessage)
      setError(errorMessage)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    if (autoFetch && uuid) {
      fetchBalance()
    }
  }, [fetchBalance, autoFetch, uuid])

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  }
}

// Hook para obtener historial de créditos
export const useHistorialCreditos = (
  uuid: string,
  autoFetch: boolean = true
) => {
  const [historial, setHistorial] = useState<HistorialResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistorial = useCallback(async () => {
    if (!uuid) return

    try {
      setLoading(true)
      setError(null)
      const response = await creditosService.obtenerHistorial(uuid)
      setHistorial(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setHistorial(null)
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    if (autoFetch && uuid) {
      fetchHistorial()
    }
  }, [fetchHistorial, autoFetch, uuid])

  return {
    historial,
    loading,
    error,
    refetch: fetchHistorial,
  }
}

// Hook para editar balance de créditos
export const useEditarBalance = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editarBalance = useCallback(async (uuid: string, monto: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await creditosService.editarBalance(uuid, monto)
      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    editarBalance,
    loading,
    error,
    clearError: () => setError(null),
  }
}

// Hook combinado para manejo completo de créditos de un usuario
export const useCreditos = (uuid: string) => {
  const balance = useBalance(uuid)
  const historial = useHistorialCreditos(uuid)
  const editarBalance = useEditarBalance()

  const actualizarCreditos = useCallback(
    async (monto: number) => {
      try {
        const response = await editarBalance.editarBalance(uuid, monto)
        // Refrescar el balance después de editar
        balance.refetch()
        // Opcionalmente refrescar el historial también
        historial.refetch()
        return response
      } catch (error) {
        throw error
      }
    },
    [uuid, editarBalance, balance, historial]
  )

  return {
    // Balance
    balance: balance.balance,
    balanceLoading: balance.loading,
    balanceError: balance.error,

    // Historial
    historial: historial.historial,
    historialLoading: historial.loading,
    historialError: historial.error,

    // Editar balance
    editarBalance: actualizarCreditos,
    editarLoading: editarBalance.loading,
    editarError: editarBalance.error,

    // Métodos de refetch
    refetchBalance: balance.refetch,
    refetchHistorial: historial.refetch,
    clearEditarError: editarBalance.clearError,
  }
}
