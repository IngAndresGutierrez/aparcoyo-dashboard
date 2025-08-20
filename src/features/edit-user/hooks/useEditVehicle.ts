// hooks/useVehiculos.ts

import { useState, useEffect, useCallback } from 'react'


import vehiculosService from '../services/service-edit-vehicle'
import { CreateVehiculoRequest, UpdateVehiculoRequest, Vehiculo, VehiculosError, VehiculosFilters } from '../types/edit-vehicle'

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
  fetchVehiculosByUserId: (userId: string, filters?: VehiculosFilters) => Promise<void>
  fetchVehiculoById: (vehiculoId: string) => Promise<void>
  
  // Funciones CRUD
  createVehiculo: (vehiculoData: CreateVehiculoRequest) => Promise<boolean>
  updateVehiculo: (vehiculoId: string, vehiculoData: UpdateVehiculoRequest) => Promise<boolean>
  updateVehiculoAdmin: (userId: string, vehiculoId: string, vehiculoData: UpdateVehiculoRequest) => Promise<boolean>
  deleteVehiculo: (vehiculoId: string) => Promise<boolean>
  deleteVehiculoAdmin: (userId: string, vehiculoId: string) => Promise<boolean>
  
  // Funciones de utilidad
  clearError: () => void
  clearVehiculo: () => void
  refreshVehiculos: () => Promise<void>
}

export const useVehiculos = (initialFilters?: VehiculosFilters): UseVehiculosReturn => {
  const [state, setState] = useState<UseVehiculosState>({
    vehiculos: [],
    vehiculo: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10
  })

  const [currentFilters, setCurrentFilters] = useState<VehiculosFilters | undefined>(initialFilters)

  // Helper para manejar errores
  const handleError = useCallback((error: unknown) => {
    let errorMessage = 'Error desconocido'
    
    if (error && typeof error === 'object' && 'message' in error) {
      // Si es un VehiculosError del servicio
      const vehiculoError = error as VehiculosError
      errorMessage = vehiculoError.message
    } else if (error instanceof Error) {
      // Si es un Error estándar
      errorMessage = error.message
    } else if (typeof error === 'string') {
      // Si es un string
      errorMessage = error
    }
    
    setState(prev => ({ 
      ...prev, 
      error: errorMessage,
      loading: false 
    }))
  }, [])

  // Obtener vehículos del usuario autenticado
  const fetchVehiculos = useCallback(async (filters?: VehiculosFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await vehiculosService.getVehiculos(filters)
      setState(prev => ({
        ...prev,
        vehiculos: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false
      }))
      setCurrentFilters(filters)
    } catch (error) {
      handleError(error)
    }
  }, [handleError])

  // Obtener vehículos de un usuario específico (admin)
  const fetchVehiculosByUserId = useCallback(async (userId: string, filters?: VehiculosFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await vehiculosService.getVehiculosByUserId(userId, filters)
      setState(prev => ({
        ...prev,
        vehiculos: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false
      }))
      setCurrentFilters(filters)
    } catch (error) {
      handleError(error)
    }
  }, [handleError])

  // Obtener un vehículo específico
  const fetchVehiculoById = useCallback(async (vehiculoId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await vehiculosService.getVehiculoById(vehiculoId)
      setState(prev => ({
        ...prev,
        vehiculo: response.data,
        loading: false
      }))
    } catch (error) {
      handleError(error)
    }
  }, [handleError])

  // Crear nuevo vehículo
  const createVehiculo = useCallback(async (vehiculoData: CreateVehiculoRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      await vehiculosService.createVehiculo(vehiculoData)
      setState(prev => ({ ...prev, loading: false }))
      // Refresh la lista después de crear
      await fetchVehiculos(currentFilters)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }, [handleError, fetchVehiculos, currentFilters])

  // Actualizar vehículo del usuario autenticado
  const updateVehiculo = useCallback(async (vehiculoId: string, vehiculoData: UpdateVehiculoRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await vehiculosService.updateVehiculo(vehiculoId, vehiculoData)
      setState(prev => ({ 
        ...prev, 
        vehiculo: response.data,
        loading: false 
      }))
      // Refresh la lista después de actualizar
      await fetchVehiculos(currentFilters)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }, [handleError, fetchVehiculos, currentFilters])

  // Actualizar vehículo como admin
  const updateVehiculoAdmin = useCallback(async (userId: string, vehiculoId: string, vehiculoData: UpdateVehiculoRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await vehiculosService.updateVehiculoAdmin(userId, vehiculoId, vehiculoData)
      setState(prev => ({ 
        ...prev, 
        vehiculo: response.data,
        loading: false 
      }))
      // Refresh la lista después de actualizar
      await fetchVehiculosByUserId(userId, currentFilters)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }, [handleError, fetchVehiculosByUserId, currentFilters])

  // Eliminar vehículo del usuario autenticado
  const deleteVehiculo = useCallback(async (vehiculoId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      await vehiculosService.deleteVehiculo(vehiculoId)
      setState(prev => ({ ...prev, loading: false }))
      // Refresh la lista después de eliminar
      await fetchVehiculos(currentFilters)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }, [handleError, fetchVehiculos, currentFilters])

  // Eliminar vehículo como admin
  const deleteVehiculoAdmin = useCallback(async (userId: string, vehiculoId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      await vehiculosService.deleteVehiculoAdmin(userId, vehiculoId)
      setState(prev => ({ ...prev, loading: false }))
      // Refresh la lista después de eliminar
      await fetchVehiculosByUserId(userId, currentFilters)
      return true
    } catch (error) {
      handleError(error)
      return false
    }
  }, [handleError, fetchVehiculosByUserId, currentFilters])

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Limpiar vehículo seleccionado
  const clearVehiculo = useCallback(() => {
    setState(prev => ({ ...prev, vehiculo: null }))
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
    refreshVehiculos
  }
}

export default useVehiculos