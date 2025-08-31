// hooks/useVehiculos.ts - VERSION CORREGIDA

import { useState, useEffect, useCallback } from "react"
import vehiculosService from "../services/service-edit-vehicle"
import {
  CreateVehiculoRequest,
  UpdateVehiculoRequest,
  Vehiculo,
  VehiculosError,
  VehiculosFilters,
} from "../types/edit-vehicle"

interface UseVehiculosState {
  vehiculos: Vehiculo[]
  vehiculo: Vehiculo | null
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
}

interface UseVehiculosReturn extends UseVehiculosState {
  // Funciones para obtener datos
  fetchVehiculos: (filters?: VehiculosFilters) => Promise<void>
  fetchVehiculosByUserId: (
    userId: string,
    filters?: VehiculosFilters
  ) => Promise<void>
  fetchVehiculoById: (vehiculoId: string) => Promise<void>

  // Funciones CRUD - AHORA LANZAN ERRORES
  createVehiculo: (vehiculoData: CreateVehiculoRequest) => Promise<Vehiculo>
  updateVehiculo: (
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ) => Promise<Vehiculo>
  updateVehiculoAdmin: (
    userId: string,
    vehiculoId: string,
    vehiculoData: UpdateVehiculoRequest
  ) => Promise<Vehiculo>
  deleteVehiculo: (vehiculoId: string) => Promise<void>
  deleteVehiculoAdmin: (userId: string, vehiculoId: string) => Promise<void>

  // Funciones de utilidad
  clearError: () => void
  clearVehiculo: () => void
  refreshVehiculos: () => Promise<void>
}

export const useVehiculos = (
  initialFilters?: VehiculosFilters
): UseVehiculosReturn => {
  const [state, setState] = useState<UseVehiculosState>({
    vehiculos: [],
    vehiculo: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
  })

  const [currentFilters, setCurrentFilters] = useState<
    VehiculosFilters | undefined
  >(initialFilters)

  // Helper para manejar errores SIN SWALLOW - propaga el error
  const handleError = useCallback((error: unknown, shouldThrow = false) => {
    let errorMessage = "Error desconocido"

    if (error && typeof error === "object" && "message" in error) {
      // Si es un VehiculosError del servicio
      const vehiculoError = error as VehiculosError
      errorMessage = vehiculoError.message
    } else if (error instanceof Error) {
      // Si es un Error estándar
      errorMessage = error.message
    } else if (typeof error === "string") {
      // Si es un string
      errorMessage = error
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }))

    // Si shouldThrow es true, lanzar el error original
    if (shouldThrow) {
      throw error
    }
  }, [])

  // Obtener vehículos del usuario autenticado
  const fetchVehiculos = useCallback(
    async (filters?: VehiculosFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await vehiculosService.getVehiculos(filters)
        setState((prev) => ({
          ...prev,
          vehiculos: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit,
          loading: false,
        }))
        setCurrentFilters(filters)
      } catch (error) {
        handleError(error) // No lanzar en fetch
      }
    },
    [handleError]
  )

  // Obtener vehículos de un usuario específico (admin)
  const fetchVehiculosByUserId = useCallback(
    async (userId: string, filters?: VehiculosFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await vehiculosService.getVehiculosByUserId(
          userId,
          filters
        )
        setState((prev) => ({
          ...prev,
          vehiculos: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit,
          loading: false,
        }))
        setCurrentFilters(filters)
      } catch (error) {
        handleError(error) // No lanzar en fetch
      }
    },
    [handleError]
  )

  // Obtener un vehículo específico
  const fetchVehiculoById = useCallback(
    async (vehiculoId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await vehiculosService.getVehiculoById(vehiculoId)
        setState((prev) => ({
          ...prev,
          vehiculo: response.data,
          loading: false,
        }))
      } catch (error) {
        handleError(error) // No lanzar en fetch
      }
    },
    [handleError]
  )

  // 🔥 CREAR NUEVO VEHÍCULO - AHORA LANZA ERRORES SIN LOGS DUPLICADOS
  const createVehiculo = useCallback(
    async (vehiculoData: CreateVehiculoRequest): Promise<Vehiculo> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await vehiculosService.createVehiculo(vehiculoData)

        setState((prev) => ({ ...prev, loading: false }))

        // Refresh la lista después de crear (sin await para no bloquear)
        fetchVehiculos(currentFilters).catch(() => {}) // Silenciar errores de refresh

        return response.data
      } catch (error) {
        // Solo actualizar estado interno, NO hacer console.error
        // El servicio ya mostró el toast de error
        setState((prev) => ({
          ...prev,
          error:
            error && typeof error === "object" && "message" in error
              ? (error as VehiculosError).message
              : "Error al crear vehículo",
          loading: false,
        }))

        // IMPORTANTE: Lanzar el error para que el modal lo capture
        throw error
      }
    },
    [fetchVehiculos, currentFilters]
  )

  // 🔥 ACTUALIZAR VEHÍCULO - AHORA LANZA ERRORES
  const updateVehiculo = useCallback(
    async (
      vehiculoId: string,
      vehiculoData: UpdateVehiculoRequest
    ): Promise<Vehiculo> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await vehiculosService.updateVehiculo(
          vehiculoId,
          vehiculoData
        )
        setState((prev) => ({
          ...prev,
          vehiculo: response.data,
          loading: false,
        }))

        // Refresh la lista después de actualizar
        fetchVehiculos(currentFilters).catch(console.error)

        return response.data
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error && typeof error === "object" && "message" in error
              ? (error as VehiculosError).message
              : "Error al actualizar vehículo",
          loading: false,
        }))

        throw error
      }
    },
    [fetchVehiculos, currentFilters]
  )

  // 🔥 ACTUALIZAR VEHÍCULO ADMIN - AHORA LANZA ERRORES
  const updateVehiculoAdmin = useCallback(
    async (
      userId: string,
      vehiculoId: string,
      vehiculoData: UpdateVehiculoRequest
    ): Promise<Vehiculo> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await vehiculosService.updateVehiculoAdmin(
          userId,
          vehiculoId,
          vehiculoData
        )
        setState((prev) => ({
          ...prev,
          vehiculo: response.data,
          loading: false,
        }))

        // Refresh la lista después de actualizar
        fetchVehiculosByUserId(userId, currentFilters).catch(console.error)

        return response.data
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error && typeof error === "object" && "message" in error
              ? (error as VehiculosError).message
              : "Error al actualizar vehículo",
          loading: false,
        }))

        throw error
      }
    },
    [fetchVehiculosByUserId, currentFilters]
  )

  // 🔥 ELIMINAR VEHÍCULO - AHORA LANZA ERRORES
  const deleteVehiculo = useCallback(
    async (vehiculoId: string): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        await vehiculosService.deleteVehiculo(vehiculoId)
        setState((prev) => ({ ...prev, loading: false }))

        // Refresh la lista después de eliminar
        fetchVehiculos(currentFilters).catch(console.error)
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error && typeof error === "object" && "message" in error
              ? (error as VehiculosError).message
              : "Error al eliminar vehículo",
          loading: false,
        }))

        throw error
      }
    },
    [fetchVehiculos, currentFilters]
  )

  // 🔥 ELIMINAR VEHÍCULO ADMIN - AHORA LANZA ERRORES
  const deleteVehiculoAdmin = useCallback(
    async (userId: string, vehiculoId: string): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        await vehiculosService.deleteVehiculoAdmin(userId, vehiculoId)
        setState((prev) => ({ ...prev, loading: false }))

        // Refresh la lista después de eliminar
        fetchVehiculosByUserId(userId, currentFilters).catch(console.error)
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error && typeof error === "object" && "message" in error
              ? (error as VehiculosError).message
              : "Error al eliminar vehículo",
          loading: false,
        }))

        throw error
      }
    },
    [fetchVehiculosByUserId, currentFilters]
  )

  // Limpiar error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Limpiar vehículo seleccionado
  const clearVehiculo = useCallback(() => {
    setState((prev) => ({ ...prev, vehiculo: null }))
  }, [])

  // Refrescar vehículos
  const refreshVehiculos = useCallback(async () => {
    await fetchVehiculos(currentFilters)
  }, [fetchVehiculos, currentFilters])

  // Cargar vehículos iniciales si se proporcionan filtros
  useEffect(() => {
    if (initialFilters) {
      fetchVehiculos(initialFilters)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo en el mount inicial

  return {
    ...state,
    fetchVehiculos,
    fetchVehiculosByUserId,
    fetchVehiculoById,
    createVehiculo,
    updateVehiculo,
    updateVehiculoAdmin,
    deleteVehiculo,
    deleteVehiculoAdmin,
    clearError,
    clearVehiculo,
    refreshVehiculos,
  }
}

export default useVehiculos
