/* eslint-disable @typescript-eslint/no-explicit-any */
// services/header-service.ts

import { PlazaDetailResponse } from "../types/header-plaza"

const BASE_URL = "https://kns.aparcoyo.com"

interface PlazaByIdParams {
  plazaId: string
  signal?: AbortSignal
}

interface PlazaByIdResponse {
  success: boolean
  data: PlazaDetailResponse
  status: number
}

// Interfaz para el resultado de eliminación
interface DeletePlazaResponse {
  success: boolean
  message: string
  canDelete: boolean
  error?: string
}

export const deletePlazaService = async (
  plazaId: string
): Promise<DeletePlazaResponse> => {
  console.log("🗑️ Iniciando eliminación de plaza:", plazaId)

  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token")

  if (!token) {
    console.log("❌ Token no encontrado")
    return {
      success: false,
      message: "Token de autenticación no encontrado",
      canDelete: false,
      error: "NO_TOKEN",
    }
  }

  const url = `${BASE_URL}/apa/plazas/${plazaId}`
  console.log("🌐 URL de eliminación:", url)

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("📡 Response status:", response.status, response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("📄 Error text completo:", errorText)

      // Intentar parsear el error como JSON
      let errorData: any = null
      try {
        errorData = JSON.parse(errorText)
        console.log("🔍 Error parseado:", errorData)
      } catch {
        errorData = { message: errorText }
        console.log("⚠️ Error no es JSON válido, usando texto directo")
      }

      // Log detallado del error
      console.log("❌ Error eliminando plaza:", {
        status: response.status,
        errorData,
        plazaId,
        url,
      })

      // Manejar diferentes tipos de errores
      switch (response.status) {
        case 400:
          // Error específico: plaza con reservas activas
          if (errorData.message?.includes("reservas activas")) {
            console.log("🚫 Plaza tiene reservas activas")
            return {
              success: false,
              message:
                "No se puede eliminar la plaza porque tiene reservas activas",
              canDelete: false,
              error: "HAS_ACTIVE_RESERVATIONS",
            }
          }
          // Otros errores 400
          console.log("⚠️ Error 400 genérico")
          return {
            success: false,
            message: errorData.message || "Solicitud inválida",
            canDelete: false,
            error: "BAD_REQUEST",
          }

        case 401:
          console.log("🔐 Error de autenticación")
          return {
            success: false,
            message: "No autorizado - verifica tu sesión",
            canDelete: false,
            error: "UNAUTHORIZED",
          }

        case 403:
          console.log("🚫 Sin permisos")
          return {
            success: false,
            message: "No tienes permisos para eliminar esta plaza",
            canDelete: false,
            error: "FORBIDDEN",
          }

        case 404:
          console.log("🔍 Plaza no encontrada")
          return {
            success: false,
            message: "Plaza no encontrada",
            canDelete: false,
            error: "NOT_FOUND",
          }

        case 500:
          console.log("🔥 Error del servidor")
          return {
            success: false,
            message: "Error interno del servidor. Intenta más tarde",
            canDelete: false,
            error: "SERVER_ERROR",
          }

        default:
          console.log("❓ Error desconocido:", response.status)
          return {
            success: false,
            message: `Error inesperado: ${errorData.message || errorText}`,
            canDelete: false,
            error: "UNKNOWN_ERROR",
          }
      }
    }

    // Si llegamos aquí, la eliminación fue exitosa
    console.log("✅ Plaza eliminada exitosamente")

    // Intentar parsear la respuesta (opcional)
    try {
      const result = await response.json()
      console.log("📄 Respuesta del servidor:", result)
    } catch {
      // Si no hay JSON válido en la respuesta, no importa
      console.log("ℹ️ Respuesta sin JSON válido (normal para DELETE)")
    }

    return {
      success: true,
      message: "Plaza eliminada exitosamente",
      canDelete: true,
    }
  } catch (error: any) {
    console.error("💥 Error inesperado en deletePlazaService:", error)

    // Manejar errores de conexión
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.log("🌐 Error de conexión")
      return {
        success: false,
        message: "Error de conexión. Verifica tu internet",
        canDelete: false,
        error: "CONNECTION_ERROR",
      }
    }

    // Error genérico - NUNCA lanzar errores, siempre devolver objeto
    console.log("❓ Error genérico capturado")
    return {
      success: false,
      message: "Error inesperado al eliminar la plaza",
      canDelete: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}

export const getPlazaByIdService = async ({
  plazaId,
  signal,
}: PlazaByIdParams): Promise<PlazaByIdResponse> => {
  console.log("🔐 Iniciando petición plaza por ID:", plazaId)

  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token")

  if (!token) {
    console.error("❌ Token no encontrado")
    throw new Error("Token de autenticación no encontrado")
  }

  console.log("🔐 Token encontrado:", token ? "Sí" : "No")

  const url = `${BASE_URL}/apa/plazas/${plazaId}`

  console.log("🌐 URL completa:", url)
  console.log("📊 Plaza ID solicitado:", plazaId)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response ok:", response.ok)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Error response:", errorData)

      switch (response.status) {
        case 401:
          throw new Error("No autorizado - verifica tu sesión")
        case 403:
          throw new Error("No tienes permisos para acceder a esta plaza")
        case 404:
          throw new Error("Plaza no encontrada")
        case 500:
          throw new Error("Error interno del servidor")
        default:
          throw new Error(`Error ${response.status}: ${errorData}`)
      }
    }

    const rawData = await response.json()
    console.log("🔍 Respuesta cruda del backend (plaza individual):", rawData)

    let data: PlazaDetailResponse

    if (rawData.ok && rawData.data) {
      data = rawData.data
      console.log("✅ Plaza extraída de rawData.data:", data)
    } else if (rawData.id) {
      data = rawData
      console.log("✅ Plaza directa:", data)
    } else {
      console.error("❌ Estructura de respuesta inesperada:", rawData)
      throw new Error(
        `Plaza no encontrada. Estructura inesperada: ${JSON.stringify(rawData)}`
      )
    }

    console.log("✅ Plaza obtenida exitosamente:", {
      status: response.status,
      plazaId: data.id,
      nombre: data.nombre,
      direccion: data.direccion,
    })

    return {
      success: true,
      data,
      status: response.status,
    }
  } catch (error: any) {
    console.error("❌ Error en getPlazaByIdService:", error)

    if (error.name === "AbortError") {
      throw new Error("Petición cancelada")
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Error de conexión - verifica tu internet o que el servidor esté disponible"
      )
    }

    throw error
  }
}
