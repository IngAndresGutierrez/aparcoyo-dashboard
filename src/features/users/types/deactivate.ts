// types/deactivateUser.types.ts

// Respuesta del servidor al desactivar usuario
export interface DeactivateUserResponse {
  message: string;
  user?: {
    id: string | number;
    email?: string;
    isActive: boolean;
  };
}

// Parámetros para desactivar usuario
export interface DeactivateUserParams {
  userId: string | number;
}

// Estados del hook
export interface DeactivateUserState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}