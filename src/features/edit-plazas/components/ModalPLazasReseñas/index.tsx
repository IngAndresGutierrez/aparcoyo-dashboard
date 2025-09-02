import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Edit3, Star, CheckCircle, Sparkles } from "lucide-react"

import { toast } from "sonner"
import { useReviews } from "../../hooks/useReviews"
import { Review } from "../../types/reviews"

// Tipos específicos para el formulario y API
interface ReviewFormData {
  comentario: string
  estrellas: number
  usuario: string // ID del usuario
  plaza: string // ID de la plaza
}

interface ReviewAPIData {
  estrellas: number
  comentario: string
  usuario: string
  plaza: string
}

interface EditReviewModalProps {
  reviewId?: string
  initialData?: Partial<Review>
  isOpen: boolean
  onClose: () => void
}

const EditReviewModal = ({
  reviewId,
  initialData,
  isOpen,
  onClose,
}: EditReviewModalProps) => {
  const { createReview, updateReview, loading } = useReviews()
  const [formData, setFormData] = useState<ReviewFormData>({
    comentario: "",
    estrellas: 5,
    usuario: "",
    plaza: "",
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        comentario: initialData.comentario || "",
        estrellas: initialData.estrellas || 5,
        // Extraer IDs de los objetos si existen
        usuario:
          typeof initialData.usuario === "string"
            ? initialData.usuario
            : initialData.usuario?.uid || "",
        plaza:
          typeof initialData.plaza === "string"
            ? initialData.plaza
            : initialData.plaza?.id || "",
      })
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    try {
      // Validación de campos requeridos
      if (
        !formData.usuario.trim() ||
        !formData.plaza.trim() ||
        !formData.comentario.trim()
      ) {
        toast.error("Campos requeridos", {
          description: "Por favor, completa todos los campos antes de guardar.",
          icon: <Star className="w-4 h-4" />,
        })
        return
      }

      // Preparar datos para la API (exactamente como lo espera el backend)
      const apiData: ReviewAPIData = {
        estrellas: formData.estrellas,
        comentario: formData.comentario.trim(),
        usuario: formData.usuario.trim(),
        plaza: formData.plaza.trim(),
      }

      if (reviewId) {
        await updateReview(reviewId, apiData)
        toast.success("¡Reseña actualizada!", {
          description: `Tu reseña de ${formData.estrellas} ${
            formData.estrellas === 1 ? "estrella" : "estrellas"
          } ha sido actualizada con éxito.`,
          icon: <Sparkles className="w-4 h-4" />,
          duration: 4000,
        })
      } else {
        await createReview(apiData)
        toast.success("¡Reseña creada!", {
          description: `Tu reseña de ${formData.estrellas} ${
            formData.estrellas === 1 ? "estrella" : "estrellas"
          } ha sido publicada con éxito.`,
          icon: <CheckCircle className="w-4 h-4" />,
          duration: 4000,
        })
      }

      onClose()
    } catch (err) {
      console.error("Error al guardar reseña:", err)
      toast.error("Error al guardar", {
        description:
          "Hubo un problema al guardar tu reseña. Por favor, inténtalo de nuevo.",
        icon: <Star className="w-4 h-4 text-red-500" />,
      })
    }
  }

  const renderStars = () => {
    const handleStarClick = (clickedStar: number) => {
      // Si haces click en la misma estrella que ya está seleccionada,
      // reduce en 1 (mínimo 1 estrella)
      if (clickedStar === formData.estrellas) {
        setFormData((prev) => ({
          ...prev,
          estrellas: Math.max(1, clickedStar - 1),
        }))
      } else {
        // Si haces click en una estrella diferente, selecciona hasta esa
        setFormData((prev) => ({
          ...prev,
          estrellas: clickedStar,
        }))
      }
    }

    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-all duration-200 hover:scale-110 ${
              star <= formData.estrellas
                ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-yellow-200"
            }`}
            onClick={() => handleStarClick(star)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.estrellas}{" "}
          {formData.estrellas === 1 ? "estrella" : "estrellas"}
        </span>
      </div>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white rounded-xl shadow-xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {reviewId ? "Editar reseña" : "Crear reseña"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Calificación
            </Label>
            {renderStars()}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Usuario (ID)
            </Label>
            <input
              value={formData.usuario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, usuario: e.target.value }))
              }
              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 text-sm"
              placeholder="ID del usuario"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Plaza (ID)
            </Label>
            <input
              value={formData.plaza}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, plaza: e.target.value }))
              }
              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 text-sm"
              placeholder="ID de la plaza"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Comentario
            </Label>
            <textarea
              value={formData.comentario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comentario: e.target.value }))
              }
              placeholder="Escribe tu reseña aquí..."
              className="min-h-[120px] w-full resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditReviewModal
