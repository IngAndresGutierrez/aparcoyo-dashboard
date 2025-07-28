export interface Reserva {
  id: string;
  usuario: {
    uid: string;
    nombre: string;
    email: string;
    // agrega más campos si vienen desde el backend
  };
  plaza: {
    id: string;
    direccion: string;
    tipo: string;
    precio: number;
    // puedes extender con más info si el backend lo devuelve
  };
  matricula: string;
  fechaInicio: string;
  fechaFin: string;
  createAt: string;
  updateAt: string;
  isActive: boolean;
}

export interface ReservasResponse {
  ok: boolean;
  data: Reserva[];
  msg: string | null;
}
