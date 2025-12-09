"use client"

import { useState, useEffect, useCallback } from "react"
import { ReporteCategoria, ReportesData } from "../types/reports-table"
import { ReportesService } from "../services/reports-service"

interface UseReportesState {
  // Data completa del summary (incluye métricas y reportes)
  data: ReportesData | null
  // Categorías disponibles
  categorias: ReporteCategoria[]
  loading: boolean
  error: string | null
}

export const useReportes = () => {
  const [state, setState] = useState<UseReportesState>({
    data: null,
    categorias: [],
    loading: false,
    error: null,
  })

  // ✨ FUNCIÓN ACTUALIZADA - ahora acepta tipoReporte
  const getSummary = useCallback(
    async (filtroFecha?: string, tipoReporte?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await ReportesService.getSummary(
          filtroFecha,
          tipoReporte
        )

        if (response.ok) {
          setState((prev) => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.msg || "Error al obtener los reportes",
          }))
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error inesperado al cargar los reportes"

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))
      }
    },
    []
  )

  // Función para obtener categorías
  const getCategorias = useCallback(async () => {
    try {
      const response = await ReportesService.getCategorias()

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          categorias: response.data,
        }))
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }, [])

  // ✨ FUNCIÓN ACTUALIZADA - ahora acepta tipoReporte
  // ✨ FUNCIÓN ACTUALIZADA - ahora RETORNA los datos
  const loadAll = useCallback(
    async (filtroFecha?: string, tipoReporte?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // Hacer ambas peticiones en paralelo
        const [summaryResponse, categoriasResponse] = await Promise.all([
          ReportesService.getSummary(filtroFecha, tipoReporte),
          ReportesService.getCategorias(),
        ])

        if (summaryResponse.ok && categoriasResponse.ok) {
          setState({
            data: summaryResponse.data,
            categorias: categoriasResponse.data,
            loading: false,
            error: null,
          })

          // ✅ RETORNAR los datos cargados
          return summaryResponse.data.reportes
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: summaryResponse.msg || "Error al cargar los datos",
          }))
          return []
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error inesperado al cargar los datos"

        setState({
          data: null,
          categorias: [],
          loading: false,
          error: errorMessage,
        })

        return []
      }
    },
    []
  )

  // ✨ FUNCIÓN ACTUALIZADA - ahora RETORNA los datos
  const refresh = useCallback(
    async (filtroFecha?: string, tipoReporte?: string) => {
      return await loadAll(filtroFecha, tipoReporte)
    },
    [loadAll]
  )
  // Cargar datos iniciales
  useEffect(() => {
    loadAll()
  }, [loadAll])

  return {
    // Data completa
    data: state.data,
    categorias: state.categorias,

    // Estados
    loading: state.loading,
    error: state.error,

    // Actions - ✨ ACTUALIZADAS
    getSummary,
    getCategorias,
    loadAll,
    refresh,

    // Computed values
    hasData: !!state.data,
    hasError: !!state.error,

    // Acceso directo a propiedades comunes
    reportes: state.data?.reportes || [],
    metrics: state.data?.metrics || null,
    pagination: state.data?.pagination || null,
  }
}
