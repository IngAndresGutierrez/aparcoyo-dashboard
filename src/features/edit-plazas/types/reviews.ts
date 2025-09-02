export interface Usuario {
  uid: string
  nombre: string
  email: string
  rol: string
  foto?: string
  // ... otros campos que necesites
}

export interface Plaza {
  id: string
  nombre: string
  direccion: string
  precio: string
  // ... otros campos que necesites
}

export interface Review {
  id?: string
  estrellas: number
  comentario: string
  usuario: Usuario // ✅ Ahora es objeto
  plaza: Plaza // ✅ Ahora es objeto
  createdAt?: string
}

