import { useState } from "react"
import { reviewsService } from "../services/service-reviews"
import { Review } from "../types/reviews"

// Tipo específico para crear/actualizar reviews en la API
interface ReviewAPIData {
  estrellas: number
  comentario: string
  usuario: string // ID del usuario como string
  plaza: string // ID de la plaza como string
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("🔗 Llamando reviewsService.getAll()")
      const data = await reviewsService.getAll()
      console.log("✅ Datos recibidos:", data)
      setReviews(data)
    } catch (err) {
      console.error("❌ Error completo:", err)
      setError("Error al cargar reseñas")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Ahora usa ReviewAPIData que coincide con lo que espera el backend
  const createReview = async (review: ReviewAPIData) => {
    try {
      const newReview = await reviewsService.create(review)
      setReviews((prev) => [...prev, newReview])
      return newReview
    } catch (err) {
      setError("Error al crear reseña")
      throw err
    }
  }

  // ✅ Ahora usa ReviewAPIData que coincide con lo que espera el backend
  const updateReview = async (id: string, review: ReviewAPIData) => {
    try {
      const updated = await reviewsService.update(id, review)
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return updated
    } catch (err) {
      setError("Error al actualizar reseña")
      throw err
    }
  }

  const deleteReview = async (id: string) => {
    try {
      await reviewsService.delete(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError("Error al eliminar reseña")
      throw err // Para que el componente pueda manejar el error
    }
  }

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  }
}
