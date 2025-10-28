export interface DatosBancarios {
  cuentaBancaria: string;
  titularCuenta: string;
  nombreBanco: string;
}

export interface Banco {
  id: string;
  nombre: string;
  codigo?: string;
}

export interface RetiroRequest {
  monto: number;
}

export interface Retiro {
  id: string;
  monto: number;
  fecha: string;
  estado: 'pendiente' | 'completado' | 'fallido';
  cuentaDestino?: string;
}