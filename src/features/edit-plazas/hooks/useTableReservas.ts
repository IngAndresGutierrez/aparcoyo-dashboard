/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePlaza.ts

"use client"

import { useState, useEffect, useCallback } from "react"
import { Reserva, SortParams, UsePlazaState } from "../types/table-reservas"

import { ApiError } from "../types/table-reservas"
import { plazaApi } from "../services/service-table"

interface UsePlazaOptions {
  autoFetch?: boolean
  refetchInterval?: number
}

export function usePlaza(plazaId: string, options: UsePlazaOptions = {}) {
  const { autoFetch = true, refetchInterval } = options

  const [state, setState] = useState<UsePlazaState>({
    plaza: null,
    reservas: [],
    loading: false,
    error: null,
  })

  // Función para obtener la plaza
  const fetchPlaza = useCallback(async () => {
    if (!plazaId) {
      console.warn("⚠️ No se proporcionó plazaId")
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log(`🔄 Cargando datos para plaza: ${plazaId}`)

      const plaza = await plazaApi.getById(plazaId)

      // ✨ LOGS DE DEBUG
      console.log("✅ Plaza completa recibida:", plaza)
      console.log("📊 Reservas encontradas:", plaza.reservas?.length || 0)
      console.log("📋 Primera reserva:", plaza.reservas?.[0])

      // Extraer reservas - SIEMPRE devolver un array
      const reservas = plaza.reservas || [] // 🔥 Garantiza que siempre sea Reserva[]

      setState({
        plaza,
        reservas,
        loading: false,
        error: null,
      })
    } catch (error) {
      const apiError = error as ApiError
      console.error("❌ Error fetching plaza:", apiError)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }))
    }
  }, [plazaId])

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    return fetchPlaza()
  }, [fetchPlaza])

  // Función para editar una reserva
  const editReserva = useCallback(
    async (reservaId: string, updates: Partial<Reserva>) => {
      try {
        setState((prev) => ({ ...prev, loading: true }))

        const updatedReserva = await plazaApi.updateReserva(reservaId, updates)

        // Actualizar la reserva en el estado local
        setState((prev) => ({
          ...prev,
          reservas: prev.reservas.map((reserva) =>
            reserva.id === reservaId
              ? { ...reserva, ...updatedReserva }
              : reserva
          ),
          loading: false,
        }))

        return updatedReserva
      } catch (error) {
        const apiError = error as ApiError
        setState((prev) => ({ ...prev, error: apiError, loading: false }))
        throw apiError
      }
    },
    []
  )

  // Función para eliminar una reserva
  const deleteReserva = useCallback(async (reservaId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }))

      await plazaApi.deleteReserva(reservaId)

      // Remover la reserva del estado local
      setState((prev) => ({
        ...prev,
        reservas: prev.reservas.filter((reserva) => reserva.id !== reservaId),
        loading: false,
      }))
    } catch (error) {
      const apiError = error as ApiError
      setState((prev) => ({ ...prev, error: apiError, loading: false }))
      throw apiError
    }
  }, [])

  // Función para ordenar reservas localmente
  const sortReservas = useCallback(({ column, direction }: SortParams) => {
    setState((prev) => ({
      ...prev,
      reservas: [...prev.reservas].sort((a, b) => {
        let aValue: any
        let bValue: any

        // Manejar diferentes tipos de columnas
        switch (column) {
          case "usuario":
            aValue = a.usuario?.nombre?.toLowerCase() || ""
            bValue = b.usuario?.nombre?.toLowerCase() || ""
            break
          case "fechaConfirmacion":
          case "fechaReserva":
            aValue = new Date(a[column as keyof Reserva] as string)
            bValue = new Date(b[column as keyof Reserva] as string)
            break
          case "precio":
          case "comision":
            aValue = a[column] || 0
            bValue = b[column] || 0
            break
          case "estado":
            aValue = a.estado
            bValue = b.estado
            break
          default:
            return 0
        }

        if (aValue < bValue) return direction === "asc" ? -1 : 1
        if (aValue > bValue) return direction === "asc" ? 1 : -1
        return 0
      }),
    }))
  }, [])

  // Efecto para fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchPlaza()
    }
  }, [fetchPlaza, autoFetch])

  // Efecto para refetch automático (opcional)
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchPlaza, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchPlaza, refetchInterval])

  return {
    // Estado
    ...state,

    // Acciones
    refresh,
    editReserva,
    deleteReserva,
    sortReservas,

    // Utilidades
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.plaza,
    totalReservas: state.reservas.length, // 🔥 Ya no necesita optional chaining
    reservasProgramadas: state.reservas.filter((r) => r.estado === "programado")
      .length,
    reservasConcluidas: state.reservas.filter((r) => r.estado === "concluida")
      .length,
    reservasCanceladas: state.reservas.filter((r) => r.estado === "cancelada")
      .length,
  }
}

// Hook alternativo para cuando solo necesites las reservas
export function useReservas(plazaId: string, options: UsePlazaOptions = {}) {
  const {
    reservas,
    loading,
    error,
    editReserva,
    deleteReserva,
    sortReservas,
    refresh,
  } = usePlaza(plazaId, options)

  return {
    reservas,
    loading,
    error,
    editReserva,
    deleteReserva,
    sortReservas,
    refresh,
  }
}
