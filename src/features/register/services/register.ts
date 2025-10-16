import axios from "axios"

const BASE_URL = "https://kns.aparcoyo.com/apa/auth"

interface RegisterData {
  rol: string
  documento: string
  nombre: string
  telefono: string
  email: string
  password: string
  direccion: string
  isActive: boolean
}

export const registerService = (data: RegisterData) => {
  return axios.post(`${BASE_URL}/register`, data)
}
