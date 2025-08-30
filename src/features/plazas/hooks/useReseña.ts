import { useState, useCallback } from 'react';
import { PlazasUsuarioResponse, UpdateReviewRequest } from '../types/reseñas';
import { plazaReviewsService } from '../services/reseña-service';

interface UsePlazaReviewsState {
  data: PlazasUsuarioResponse | null;
  loading: boolean;
  error: string | null;
}

interface UsePlazaReviewsReturn extends UsePlazaReviewsState {
  fetchPlazasByUser: (uid: string) => Promise<void>;
  fetchPlazaById: (plazaId: string) => Promise<void>; // ← Nueva función
  updateReview: (plazaId: string, reviewId: string, updateData: UpdateReviewRequest) => Promise<void>;
  deleteReview: (plazaId: string, reviewId: string) => Promise<void>;
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const usePlazaReviews = (): UsePlazaReviewsReturn => {
  const [state, setState] = useState<UsePlazaReviewsState>({
    data: null,
    loading: false,
    error: null,
  });
  
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  const [lastPlazaId, setLastPlazaId] = useState<string | null>(null); // ← Nuevo estado

  // Función original: obtener todas las plazas de un usuario
  const fetchPlazasByUser = useCallback(async (uid: string) => {
    console.log('🚀 Hook: fetchPlazasByUser con UID:', uid);
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastUserId(uid);
    setLastPlazaId(null); // ← Limpiar plazaId cuando se busca por usuario
    
    try {
      const response = await plazaReviewsService.getPlazasByUser(uid);
      console.log('🎉 Hook: Respuesta recibida:', response);
      console.log('📊 Hook: Plazas encontradas:', response.data.length);
      
      setState(prev => ({ 
        ...prev, 
        data: response, 
        loading: false 
      }));
    } catch (error) {
      console.log('❌ Hook: Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    }
  }, []);

  // ✨ Nueva función: obtener una plaza específica por ID
  const fetchPlazaById = useCallback(async (plazaId: string) => {
    console.log('🚀 Hook: fetchPlazaById con ID:', plazaId);
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastPlazaId(plazaId);
    setLastUserId(null); // ← Limpiar userId cuando se busca por plaza
    
    try {
      const response = await plazaReviewsService.getPlazaById(plazaId);
      console.log('🎉 Hook: Plaza específica recibida:', response);
      
      // Convertir la respuesta de una plaza al mismo formato que el array de plazas
      const formattedResponse: PlazasUsuarioResponse = {
        ok: true,
        msg: 'Plaza obtenida correctamente',
        data: [response] // ← Envolver en array para mantener compatibilidad
      };
      
      setState(prev => ({ 
        ...prev, 
        data: formattedResponse, 
        loading: false 
      }));
    } catch (error) {
      console.log('❌ Hook: Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error obteniendo plaza';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    }
  }, []);

  const updateReview = useCallback(async (
    plazaId: string, 
    reviewId: string, 
    updateData: UpdateReviewRequest
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await plazaReviewsService.updateReview(plazaId, reviewId, updateData);
      
      // ✨ Refrescar según el contexto actual
      if (lastPlazaId) {
        // Estamos en modo plaza específica
        await fetchPlazaById(lastPlazaId);
      } else if (lastUserId) {
        // Estamos en modo usuario
        await fetchPlazasByUser(lastUserId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando reseña';
      setState(prev => ({ 
        
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    }
  }, [lastUserId, lastPlazaId, fetchPlazasByUser, fetchPlazaById]);

  const deleteReview = useCallback(async (plazaId: string, reviewId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await plazaReviewsService.deleteReview(plazaId, reviewId);
      
      // ✨ Refrescar según el contexto actual
      if (lastPlazaId) {
        // Estamos en modo plaza específica
        await fetchPlazaById(lastPlazaId);
      } else if (lastUserId) {
        // Estamos en modo usuario
        await fetchPlazasByUser(lastUserId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando reseña';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    }
  }, [lastUserId, lastPlazaId, fetchPlazasByUser, fetchPlazaById]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refetch = useCallback(async () => {
    // ✨ Refrescar según el contexto actual
    if (lastPlazaId) {
      await fetchPlazaById(lastPlazaId);
    } else if (lastUserId) {
      await fetchPlazasByUser(lastUserId);
    }
  }, [lastUserId, lastPlazaId, fetchPlazasByUser, fetchPlazaById]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchPlazasByUser,
    fetchPlazaById, // ← Nueva función exportada
    updateReview,
    deleteReview,
    clearError,
    refetch,
  };
};