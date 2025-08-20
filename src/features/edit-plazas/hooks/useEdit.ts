// hooks/useModalPlaza.ts
"use client"

import { useState, useCallback } from "react"
import modalPlazaService from "../services/service-edit"
import { ActualizarPlazaModal, PlazaModal } from "../types/edit-plazas"


// ✅ Definir FormDataModal aquí mismo
export interface FormDataModal {
  nombre: string        // No titulo
  descripcion: string
  precio: number        // number para formulario
  propietario: {
    id: string         // id para formulario
    nombre: string
    email: string      // email para formulario
  }
}

export interface UseModalPlazaReturn {
  // Datos
  plazaData: PlazaModal | null
  
  // Estados
  loading: boolean
  saving: boolean
  error: string | null
  
  // Funciones
  cargarPlaza: () => Promise<void>
  guardarCambios: (formData: FormDataModal) => Promise<PlazaModal>
  clearError: () => void
  resetData: () => void
}

export function useModalPlaza(plazaId: string): UseModalPlazaReturn {
  // Estados principales
  const [plazaData, setPlazaData] = useState<PlazaModal | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar datos de la plaza desde el backend
   */
  const cargarPlaza = useCallback(async (): Promise<void> => {
    if (!plazaId) {
      setError('ID de plaza no válido')
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
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("❌ Error cargando plaza para modal:", err)
      
      // Limpiar datos en caso de error
      setPlazaData(null)
    } finally {
      setLoading(false)
    }
  }, [plazaId])

  /**
   * Guardar cambios en el backend
   */
  const guardarCambios = useCallback(async (formData: FormDataModal): Promise<PlazaModal> => {
    if (!plazaId) {
      throw new Error('ID de plaza no válido')
    }

    try {
      setSaving(true)
      setError(null)

      console.log("🔄 Guardando cambios en modal:", formData)

      // ✅ Transformar datos del formulario al formato de la API (CORREGIDO)
      const datosParaAPI: ActualizarPlazaModal = {
        nombre: formData.nombre.trim(),                    // ✅ nombre, no titulo
        descripcion: formData.descripcion.trim(),
        precio: formData.precio.toString(),               // ✅ string para API
        propietarioUid: formData.propietario.id,          // ✅ propietarioUid, no propietarioId
      }

      // ✅ Validaciones básicas antes de enviar (CORREGIDAS)
      if (!datosParaAPI.nombre) {                          // ✅ nombre, no titulo
        throw new Error('El nombre es requerido')
      }
      
      if (parseFloat(datosParaAPI.precio) <= 0) {          // ✅ validar como número
        throw new Error('El precio debe ser mayor a 0')
      }
      
      if (!datosParaAPI.propietarioUid) {                  // ✅ propietarioUid
        throw new Error('Debe seleccionar un propietario')
      }

      const plazaActualizada = await modalPlazaService.actualizarPlaza(plazaId, datosParaAPI)

      // Actualizar los datos locales
      setPlazaData(plazaActualizada)
      console.log("✅ Plaza actualizada:", plazaActualizada)

      return plazaActualizada

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar"
      setError(errorMessage)
      console.error("❌ Error guardando plaza:", err)
      
      // Re-lanzar el error para que el modal pueda manejarlo
      throw err
    } finally {
      setSaving(false)
    }
  }, [plazaId])

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
    // Datos
    plazaData,
    
    // Estados
    loading,
    saving,
    error,
    
    // Funciones
    cargarPlaza,
    guardarCambios,
    clearError,
    resetData,
  }
}

export default useModalPlaza