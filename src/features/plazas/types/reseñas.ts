/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Usuario {
  id: string;
  nombre?: string;
  email?: string;
  avatar?: string;
  
  // Permitir cualquier otra propiedad que venga del backend
  [key: string]: any;
}

export interface Resena {
  id: string;
  usuarioId?: string;
  usuario?: Usuario;
  calificacion?: number;
  comentario?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  
  // Permitir cualquier otra propiedad que venga del backend
  [key: string]: any;
}

export interface Plaza {
  id: string;
  nombre: string;
  direccion?: string;
  propietarioId?: string;
  calificacionPromedio?: number;
  totalResenas?: number;
  resenas?: Resena[];
  fechaCreacion?: string;
  estado?: 'activa' | 'inactiva' | 'suspendida';
  
  // Propiedades opcionales para evitar errores de tipado
  tipo?: string;
  lat?: number;
  lng?: number;
  precio?: number;
  descripcion?: string;
  imagenes?: string[];
  horarios?: {
    apertura: string;
    cierre: string;
  };
  servicios?: string[];
  capacidad?: number;
  disponible?: boolean;
  
  // Permitir cualquier otra propiedad que venga del backend
  [key: string]: any;
}

// ✅ ESTRUCTURA REAL DEL BACKEND
export interface PlazasUsuarioResponse {
  ok: boolean;           // ← Confirmado
  data: Plaza[];         // ← Array de plazas (puede estar vacío)
  msg: string;           // ← Mensaje del backend
}

export interface UpdateReviewRequest {
  comentario: string;
  calificacion?: number;
}

export interface UpdateReviewResponse {
  ok?: boolean;
  data?: Resena;
  msg?: string;
}

export interface DeleteReviewResponse {
  ok?: boolean;
  msg?: string;
}