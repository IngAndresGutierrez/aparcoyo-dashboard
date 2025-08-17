// hooks/useDeleteReserva.ts
import { useState } from 'react';
import { reservaService } from '../services/delete-service';


interface UseDeleteReservaState {
  isDeleting: boolean;
  error: string | null;
  deleteReserva: (id: string | number) => Promise<boolean>;
}

export const useDeleteReserva = (): UseDeleteReservaState => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReserva = async (id: string | number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await reservaService.deleteReserva(id);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Error al eliminar la reserva');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    error,
    deleteReserva
  };
};