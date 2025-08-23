import {
  DeleteReviewResponse,
  PlazasUsuarioResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  Plaza,
} from "../types/reseñas"

class PlazaReviewsService {
  private baseURL: string

  constructor() {
    this.baseURL = "https://aparcoyo-back.onrender.com/apa/plazas"
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem("token")
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getPlazasByUser(uid: string): Promise<PlazasUsuarioResponse> {
    console.log(`📤 Obteniendo plazas del usuario: ${uid}`)

    try {
      const response = await fetch(`${this.baseURL}/usuario/${uid}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error obteniendo plazas:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Plazas obtenidas:", data)
      console.log("📊 Total plazas:", data.data?.length || 0)

      return data
    } catch (error) {
      console.error("❌ Error en getPlazasByUser:", error)
      throw error
    }
  }

  // ✨ Nueva función: obtener una plaza específica por ID
  async getPlazaById(plazaId: string): Promise<Plaza> {
    console.log(`📤 Obteniendo plaza específica: ${plazaId}`)

    try {
      const response = await fetch(`${this.baseURL}/${plazaId}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error obteniendo plaza:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Plaza específica obtenida:", data)

      // Si la respuesta viene envuelta en un objeto con 'data', extraer la plaza
      const plaza = data.data || data
      console.log("📋 Plaza procesada:", plaza)

      return plaza
    } catch (error) {
      console.error("❌ Error en getPlazaById:", error)
      throw error
    }
  }

  async updateReview(
    plazaId: string,
    reviewId: string,
    updateData: UpdateReviewRequest
  ): Promise<UpdateReviewResponse> {
    console.log(
      `📤 Actualizando reseña ${reviewId} de plaza ${plazaId}:`,
      updateData
    )

    try {
      const response = await fetch(
        `${this.baseURL}/${plazaId}/reviews/${reviewId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Reseña actualizada:", data)
      return data
    } catch (error) {
      console.error("❌ Error en updateReview:", error)
      throw error
    }
  }

  async deleteReview(
    plazaId: string,
    reviewId: string
  ): Promise<DeleteReviewResponse> {
    console.log(`📤 Eliminando reseña ${reviewId} de plaza ${plazaId}`)

    try {
      const response = await fetch(
        `${this.baseURL}/${plazaId}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Reseña eliminada:", data)
      return data
    } catch (error) {
      console.error("❌ Error en deleteReview:", error)
      throw error
    }
  }
}

export const plazaReviewsService = new PlazaReviewsService()
