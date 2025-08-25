// hooks/useModalPlaza.ts - VERSIÓN CORREGIDA
"use client"

import { useState, useCallback } from "react"
import modalPlazaService from "../services/service-edit"
import { ActualizarPlazaModal, PlazaModal } from "../types/edit-plazas"

export interface FormDataModal {
  nombre: string
  descripcion: string
  precio: number
  propietario: {
    id: string
    nombre: string
    email: string
  }
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
   * 🛠️ GUARDAR CAMBIOS CORREGIDO - PRESERVA PROPIETARIO ORIGINAL
   */
  const guardarCambios = useCallback(
    async (formData: FormDataModal): Promise<PlazaModal> => {
      if (!plazaId) {
        throw new Error("ID de plaza no válido")
      }

      try {
        setSaving(true)
        setError(null)

        console.log("🔄 Guardando cambios en modal:", formData)
        console.log("🔍 Datos originales de la plaza:", plazaData)

        // 🛠️ PRESERVAR DATOS ORIGINALES DEL PROPIETARIO ANTES DE ENVIAR
        const propietarioOriginalParaPreservar = {
          uid: formData.propietario.id, // Usar ID del formulario como UID
          nombre: formData.propietario.nombre, // Nombre del formulario (correcto)
          email: formData.propietario.email, // Email del formulario
        }

        console.log(
          "🔍 Propietario que vamos a preservar:",
          propietarioOriginalParaPreservar
        )

        const datosParaAPI: ActualizarPlazaModal = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          precio: formData.precio.toString(),
          propietarioUid: formData.propietario.id,
        }

        // Validaciones básicas
        if (!datosParaAPI.nombre) {
          throw new Error("El nombre es requerido")
        }

        if (parseFloat(datosParaAPI.precio) <= 0) {
          throw new Error("El precio debe ser mayor a 0")
        }

        if (!datosParaAPI.propietarioUid) {
          throw new Error("Debe seleccionar un propietario")
        }

        console.log("📤 Datos enviados a la API:", datosParaAPI)

        // Llamar al service
        const plazaActualizada = await modalPlazaService.actualizarPlaza(
          plazaId,
          datosParaAPI
        )

        console.log("✅ Plaza actualizada recibida:", plazaActualizada)

        // 🛠️ FORZAR PRESERVACIÓN DEL PROPIETARIO CON DATOS DEL FORMULARIO
        const plazaConPropietarioPreservado: PlazaModal = {
          ...plazaActualizada,
          propietario: {
            // 🛠️ MANTENER UID ORIGINAL DEL FORMULARIO (prop-3, no el UUID del backend)
            uid: formData.propietario.id, // ← ESTO ES CLAVE
            // 🛠️ MANTENER NOMBRE Y EMAIL DEL FORMULARIO
            nombre: formData.propietario.nombre,
            email: formData.propietario.email,
          },
        }

        console.log(
          "🔍 Plaza final con propietario preservado:",
          plazaConPropietarioPreservado.propietario
        )

        // Actualizar estado local
        setPlazaData(plazaConPropietarioPreservado)
        console.log("✅ Plaza actualizada guardada en estado local")

        return plazaConPropietarioPreservado
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
