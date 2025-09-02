import { Review } from "../types/reviews"

// Tipo específico para la API - coincide exactamente con lo que espera el backend
interface ReviewAPIData {
  estrellas: number
  comentario: string
  usuario: string // ID del usuario como string
  plaza: string // ID de la plaza como string
}

const API_BASE_URL = "https://aparcoyo-back.onrender.com"
const API_BASE = `${API_BASE_URL}/apa/resenas`

// Función helper para obtener headers con auth
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`, // o donde tengas el token
})

export const reviewsService = {
  getAll: (): Promise<Review[]> =>
    fetch(API_BASE, {
      headers: getAuthHeaders(),
    }).then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return res.json()
    }),

  getById: (id: string): Promise<Review> =>
    fetch(`${API_BASE}/${id}`, {
      headers: getAuthHeaders(),
    }).then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return res.json()
    }),

  // ✅ Ahora usa ReviewAPIData para crear
  create: (data: ReviewAPIData): Promise<Review> =>
    fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error del servidor al crear:", errorText)
        throw new Error(`Error ${res.status}: ${errorText}`)
      }
      return res.json()
    }),

  // ✅ Ahora usa ReviewAPIData para actualizar
  update: (id: string, data: ReviewAPIData): Promise<Review> =>
    fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error del servidor al actualizar:", errorText)
        throw new Error(`Error ${res.status}: ${errorText}`)
      }
      return res.json()
    }),

  delete: (id: string): Promise<boolean> =>
    fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((res) => res.ok),
}

// Exporta el tipo para usarlo en otros archivos
export type { ReviewAPIData }
