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

  const fetchPlazasByUser = useCallback(async (uid: string) => {
    console.log('🚀 Hook: fetchPlazasByUser con UID:', uid);
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastUserId(uid);
    
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

  const updateReview = useCallback(async (
    plazaId: string, 
    reviewId: string, 
    updateData: UpdateReviewRequest
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await plazaReviewsService.updateReview(plazaId, reviewId, updateData);
      if (lastUserId) {
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
  }, [lastUserId, fetchPlazasByUser]);

  const deleteReview = useCallback(async (plazaId: string, reviewId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await plazaReviewsService.deleteReview(plazaId, reviewId);
      if (lastUserId) {
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
  }, [lastUserId, fetchPlazasByUser]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refetch = useCallback(async () => {
    if (lastUserId) {
      await fetchPlazasByUser(lastUserId);
    }
  }, [lastUserId, fetchPlazasByUser]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchPlazasByUser,
    updateReview,
    deleteReview,
    clearError,
    refetch,
  };
};