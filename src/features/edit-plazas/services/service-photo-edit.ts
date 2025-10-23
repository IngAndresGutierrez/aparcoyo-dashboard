/* eslint-disable @typescript-eslint/no-explicit-any */
// services/plaza-photos.service.ts

const BASE_URL = "https://kns.aparcoyo.com"

class PlazaPhotosError extends Error {
  public code?: string
  public status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = "PlazaPhotosError"
    this.code = code
    this.status = status
  }
}

export class PlazaPhotosService {
  private static getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        null
      )
    }
    return null
  }

  // ✅ 1. GET /apa/plazas/{id} - Obtener plaza por ID (incluye imágenes)
  static async getPlazaWithPhotos(plazaId: string): Promise<{
    success: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
    error?: string
  }> {
    try {
      const token = this.getAuthToken()

      console.log(`📡 GET /apa/plazas/${plazaId}`)

      const response = await fetch(`${BASE_URL}/apa/plazas/${plazaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new PlazaPhotosError(
          `Error ${response.status}`,
          response.status.toString(),
          response.status
        )
      }

      const result = await response.json()
      console.log("✅ Plaza obtenida:", result)

      return {
        success: true,
        data: result.data || result,
      }
    } catch (error) {
      console.error("❌ Error al obtener plaza:", error)

      if (error instanceof PlazaPhotosError) {
        return {
          success: false,
          error: `Error ${error.status}: ${error.message}`,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // ✅ 2. POST /apa/plazas/{id}/fotos - Agregar fotos a una plaza
  static async agregarFotos(
    plazaId: string,
    archivos: File[]
  ): Promise<{
    success: boolean
    data?: any
    error?: string
    message?: string
  }> {
    try {
      const token = this.getAuthToken()

      console.log("🔍 DEBUG - Información de archivos:", {
        cantidad: archivos.length,
        archivos: archivos.map((f, i) => ({
          index: i,
          nombre: f.name,
          tamaño: `${(f.size / 1024).toFixed(2)} KB`,
          tipo: f.type,
          esImagen: f.type.startsWith("image/"),
        })),
      })

      // 🎯 ESTRATEGIA DIRECTA: Usar "fotos" (el que funciona)
      console.log('🎯 Usando nombre de campo correcto: "fotos"')
      let result = await this.intentarSubida(plazaId, archivos, "fotos", token)

      if (result.success) {
        return result
      }

      // Si falla con "Unexpected field", probar otras variantes
      if (
        result.error === "BAD_REQUEST" &&
        result.message?.includes("Unexpected field")
      ) {
        console.log('⚠️ "archivos" no funcionó, probando alternativas...')

        // 🧪 ESTRATEGIA 2: Probar con "archivo" (singular)
        console.log('🧪 Intentando con nombre de campo: "archivo"')
        result = await this.intentarSubida(plazaId, archivos, "archivo", token)
        if (result.success) {
          console.log('✅ Funcionó con "archivo" (singular)')
          return result
        }

        // 🧪 ESTRATEGIA 3: Probar con "files"
        console.log('🧪 Intentando con nombre de campo: "files"')
        result = await this.intentarSubida(plazaId, archivos, "files", token)
        if (result.success) {
          console.log('✅ Funcionó con "files"')
          return result
        }

        // 🧪 ESTRATEGIA 4: Probar con "fotos"
        console.log('🧪 Intentando con nombre de campo: "fotos"')
        result = await this.intentarSubida(plazaId, archivos, "fotos", token)
        if (result.success) {
          console.log('✅ Funcionó con "fotos"')
          return result
        }

        // 🧪 ESTRATEGIA 5: Probar con "images"
        console.log('🧪 Intentando con nombre de campo: "images"')
        result = await this.intentarSubida(plazaId, archivos, "images", token)
        if (result.success) {
          console.log('✅ Funcionó con "images"')
          return result
        }

        return {
          success: false,
          error: "FIELD_NAME_ERROR",
          message: `❌ Ningún nombre de campo funcionó. El backend espera un campo específico que no hemos identificado. Nombres probados: archivos, archivo, files, fotos, images. Por favor contacta al equipo de backend.`,
        }
      }

      return result
    } catch (error) {
      console.error("❌ Error crítico al agregar fotos:", error)

      return {
        success: false,
        error: "CONNECTION_ERROR",
        message: "Error de conexión. Verifica tu internet.",
      }
    }
  }

  // Método auxiliar para intentar subida con un nombre de campo específico
  private static async intentarSubida(
    plazaId: string,
    archivos: File[],
    nombreCampo: string,
    token: string | null
  ): Promise<{
    success: boolean
    data?: any
    error?: string
    message?: string
  }> {
    try {
      console.log(
        `📡 POST /apa/plazas/${plazaId}/fotos con campo "${nombreCampo}"`
      )

      const formData = new FormData()
      archivos.forEach((archivo, index) => {
        formData.append(nombreCampo, archivo, archivo.name)
        console.log(`  ✓ Archivo ${index + 1} agregado: ${archivo.name}`)
      })

      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log("📋 Headers:", headers)
      console.log(
        "📋 FormData entries:",
        Array.from(formData.entries()).map(([key]) => key)
      )

      const response = await fetch(`${BASE_URL}/apa/plazas/${plazaId}/fotos`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      let result
      try {
        result = await response.json()
      } catch {
        result = { message: await response.text() }
      }

      console.log(`📋 Respuesta [${response.status}]:`, result)

      if (!response.ok) {
        const status = response.status
        const message = result?.message || result?.msg || result?.error

        switch (status) {
          case 400:
            return {
              success: false,
              error: "BAD_REQUEST",
              message: message || "Datos inválidos. Verifica los archivos.",
            }
          case 401:
            return {
              success: false,
              error: "UNAUTHORIZED",
              message: "Sesión expirada. Inicia sesión nuevamente.",
            }
          case 403:
            return {
              success: false,
              error: "FORBIDDEN",
              message: "No tienes permisos para agregar fotos a esta plaza.",
            }
          case 404:
            return {
              success: false,
              error: "NOT_FOUND",
              message: "Plaza no encontrada.",
            }
          case 413:
            return {
              success: false,
              error: "FILE_TOO_LARGE",
              message: "Los archivos son demasiado grandes.",
            }
          default:
            return {
              success: false,
              error: "SERVER_ERROR",
              message: message || "Error del servidor al agregar fotos.",
            }
        }
      }

      console.log(`✅ Subida exitosa con campo "${nombreCampo}":`, result)

      return {
        success: true,
        data: result.data || result,
        message: "Fotos agregadas exitosamente",
      }
    } catch (error) {
      console.error(`❌ Error en intentarSubida con "${nombreCampo}":`, error)
      throw error
    }
  }

  // ✅ 3. DELETE /apa/plazas/{plazaId}/fotos/{archivoId} - Eliminar una foto específica
  static async eliminarFoto(
    plazaId: string,
    archivoId: string
  ): Promise<{
    success: boolean
    data?: any
    error?: string
    message?: string
  }> {
    try {
      const token = this.getAuthToken()

      console.log(`📡 DELETE /apa/plazas/${plazaId}/fotos/${archivoId}`)

      const response = await fetch(
        `${BASE_URL}/apa/plazas/${plazaId}/fotos/${archivoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        const status = response.status
        const message = result?.message || result?.msg || result?.error

        switch (status) {
          case 400:
            return {
              success: false,
              error: "BAD_REQUEST",
              message: message || "No se puede eliminar esta foto.",
            }
          case 401:
            return {
              success: false,
              error: "UNAUTHORIZED",
              message: "Sesión expirada. Inicia sesión nuevamente.",
            }
          case 403:
            return {
              success: false,
              error: "FORBIDDEN",
              message: "No tienes permisos para eliminar esta foto.",
            }
          case 404:
            return {
              success: false,
              error: "NOT_FOUND",
              message: "Foto no encontrada.",
            }
          default:
            return {
              success: false,
              error: "SERVER_ERROR",
              message: message || "Error del servidor al eliminar foto.",
            }
        }
      }

      console.log("✅ Foto eliminada exitosamente:", result)

      return {
        success: true,
        data: result,
        message: "Foto eliminada exitosamente",
      }
    } catch (error) {
      console.error("❌ Error al eliminar foto:", error)

      return {
        success: false,
        error: "CONNECTION_ERROR",
        message: "Error de conexión. Verifica tu internet.",
      }
    }
  }
}
