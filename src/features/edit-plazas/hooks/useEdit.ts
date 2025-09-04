// hooks/useModalPlaza.ts - VERSIÓN SIMPLIFICADA
"use client"

import { useState, useCallback } from "react"
import modalPlazaService from "../services/service-edit"
import { ActualizarPlazaModal, PlazaModal } from "../types/edit-plazas"

// ✅ FormData simplificado - SIN propietario
export interface FormDataModal {
  nombre: string
  descripcion: string
  precio: number
}

export interface UseModalPlazaReturn {
  plazaData: PlazaModal | null
  loading: boolean
  saving: boolean
  error: string | null
  cargarPlaza: () => Promise<void>
  guardarCambios: (formData: FormDataModal) => Promise<PlazaModal>
  clearError: () => void
  resetData: () => void
}

export function useModalPlaza(plazaId: string): UseModalPlazaReturn {
  const [plazaData, setPlazaData] = useState<PlazaModal | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar datos de la plaza desde el backend
   */
  const cargarPlaza = useCallback(async (): Promise<void> => {
    if (!plazaId) {
      setError("ID de plaza no válido")
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Cargando plaza para modal:", plazaId)

      const data = await modalPlazaService.obtenerPlaza(plazaId)

      setPlazaData(data)
      console.log("✅ Plaza cargada para modal:", data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("❌ Error cargando plaza para modal:", err)

      setPlazaData(null)
    } finally {
      setLoading(false)
    }
  }, [plazaId])

  /**
   * ✅ GUARDAR CAMBIOS SIMPLIFICADO - MANTIENE PROPIETARIO ORIGINAL
   */
  const guardarCambios = useCallback(
    async (formData: FormDataModal): Promise<PlazaModal> => {
      if (!plazaId || !plazaData) {
        throw new Error("ID de plaza no válido o datos no cargados")
      }

      try {
        setSaving(true)
        setError(null)

        console.log("🔄 Guardando cambios en modal:", formData)
        console.log("🔍 Datos originales de la plaza:", plazaData)

        // ✅ Crear datos para API MANTENIENDO el propietario original
        const datosParaAPI: ActualizarPlazaModal = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio: formData.precio.toString(),
          propietarioUid: plazaData.propietario.uid, // ← USAR EL PROPIETARIO ORIGINAL
        }

        // Validaciones básicas
        if (!datosParaAPI.nombre) {
          throw new Error("El nombre es requerido")
        }

        if (parseFloat(datosParaAPI.precio) <= 0) {
          throw new Error("El precio debe ser mayor a 0")
        }

        console.log("📤 Datos enviados a la API:", datosParaAPI)

        // Llamar al service
        const plazaActualizada = await modalPlazaService.actualizarPlaza(
          plazaId,
          datosParaAPI
        )

        console.log("✅ Plaza actualizada recibida:", plazaActualizada)

        // ✅ Mantener el propietario original en la respuesta
        const plazaFinal: PlazaModal = {
          ...plazaActualizada,
          propietario: plazaData.propietario, // ← PRESERVAR propietario original
        }

        console.log("🔍 Plaza final con propietario preservado:", plazaFinal)

        // Actualizar estado local
        setPlazaData(plazaFinal)
        console.log("✅ Plaza actualizada guardada en estado local")

        return plazaFinal
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al guardar"
        setError(errorMessage)
        console.error("❌ Error guardando plaza:", err)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [plazaId, plazaData]
  )

  /**
   * Limpiar errores
   */
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  /**
   * Resetear todos los datos
   */
  const resetData = useCallback((): void => {
    setPlazaData(null)
    setError(null)
    setLoading(false)
    setSaving(false)
  }, [])

  return {
    plazaData,
    loading,
    saving,
    error,
    cargarPlaza,
    guardarCambios,
    clearError,
    resetData,
  }
}

export default useModalPlaza
