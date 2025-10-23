export interface Plaza {
  id: string
  tipo: string
  direccion: string
  lat: number
  lng: number
  precio: number
  disponibilidadDesde: string
  disponibilidadHasta: string
  createAt: string
  updateAt: string
  isActive: boolean
  propietario: {
    uid: string
    nombre: string
    email: string
    rol: string
    matriculas: unknown[]
    foto: string
    documento: string
    telefono: string | null
    direccion: string
    createAt: string
    updateAt: string
    otpCode: string | null
    otpExpiresAt: string | null
    isActive: boolean
  }
  img: Array<{
    id: string
    url: string
    tipo: string
    nombre: string
    tamaño: number
    createdAt: string
  }>
}

export interface PlazasResponse {
  ok: boolean
  data: Plaza[]
  msg: string | null
}
