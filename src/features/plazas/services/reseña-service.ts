import {
  DeleteReviewResponse,
  PlazasUsuarioResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  Plaza,
} from "../types/reseñas"

class PlazaReviewsService {
  private baseURL: string
  private resenasURL: string // ← Nueva URL para reseñas

  constructor() {
    this.baseURL = "https://kns.aparcoyo.com/apa/plazas"
    this.resenasURL = "https://kns.aparcoyo.com/apa/resenas" // ← Nueva URL
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

  // ✨ Función para obtener una plaza específica por ID
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

  // 🔧 ACTUALIZADO: Usar endpoint correcto /apa/resenas/{id}
  async updateReview(
    plazaId: string, // ← Mantenemos para compatibilidad, pero no se usa en la URL
    reviewId: string,
    updateData: UpdateReviewRequest
  ): Promise<UpdateReviewResponse> {
    console.log(`📤 Actualizando reseña ${reviewId}:`, updateData)
    console.log(`🔧 Usando endpoint correcto: ${this.resenasURL}/${reviewId}`)

    try {
      const response = await fetch(
        `${this.resenasURL}/${reviewId}`, // ← URL CORREGIDA
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(updateData),
        }
      )

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error actualizando reseña:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: Cannot PATCH ${this.resenasURL}/${reviewId}`
        )
      }

      const data = await response.json()
      console.log("✅ Reseña actualizada:", data)
      return data
    } catch (error) {
      console.error("❌ Error en updateReview:", error)
      throw error
    }
  }

  // 🔧 ACTUALIZADO: Usar endpoint correcto /apa/resenas/{id}
  async deleteReview(
    plazaId: string, // ← Mantenemos para compatibilidad, pero no se usa en la URL
    reviewId: string
  ): Promise<DeleteReviewResponse> {
    console.log(`📤 Eliminando reseña ${reviewId}`)
    console.log(`🔧 Usando endpoint correcto: ${this.resenasURL}/${reviewId}`)

    try {
      const response = await fetch(
        `${this.resenasURL}/${reviewId}`, // ← URL CORREGIDA
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error eliminando reseña:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: Cannot DELETE ${this.resenasURL}/${reviewId}`
        )
      }

      const data = await response.json()
      console.log("✅ Reseña eliminada:", data)
      return data
    } catch (error) {
      console.error("❌ Error en deleteReview:", error)
      throw error
    }
  }

  // 🆕 NUEVA: Función para obtener todas las reseñas (para testing)
  async getAllReviews() {
    console.log(`📤 Obteniendo todas las reseñas desde: ${this.resenasURL}`)

    try {
      const response = await fetch(this.resenasURL, {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error obteniendo reseñas:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Todas las reseñas obtenidas:", data)
      return data
    } catch (error) {
      console.error("❌ Error en getAllReviews:", error)
      throw error
    }
  }

  // 🆕 NUEVA: Función para obtener una reseña específica (para testing)
  async getReviewById(reviewId: string) {
    console.log(`📤 Obteniendo reseña específica: ${reviewId}`)

    try {
      const response = await fetch(`${this.resenasURL}/${reviewId}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log(`📥 Status response: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error obteniendo reseña:", errorData)
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("✅ Reseña específica obtenida:", data)
      return data
    } catch (error) {
      console.error("❌ Error en getReviewById:", error)
      throw error
    }
  }
}

export const plazaReviewsService = new PlazaReviewsService()
