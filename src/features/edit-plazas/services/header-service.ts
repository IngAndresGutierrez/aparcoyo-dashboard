/* eslint-disable @typescript-eslint/no-explicit-any */
// services/header-service.ts

import { PlazaDetailResponse } from "../types/header-plaza"

const BASE_URL = "https://aparcoyo-back.onrender.com"

interface PlazaByIdParams {
  plazaId: string
  signal?: AbortSignal
}

interface PlazaByIdResponse {
  success: boolean
  data: PlazaDetailResponse
  status: number
}

// En services/header-service.ts - agregar esta función

export const deletePlazaService = async (plazaId: string) => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token")

  if (!token) {
    throw new Error("Token de autenticación no encontrado")
  }

  const url = `${BASE_URL}/apa/plazas/${plazaId}`

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Error ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Error eliminando plaza:", error)
    throw error
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
