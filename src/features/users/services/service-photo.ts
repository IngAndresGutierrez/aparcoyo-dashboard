const API_BASE_URL = "https://kns.aparcoyo.com"

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    )
  }
  return null
}

export interface UpdatePhotoResponse {
  ok: boolean
  message: string
  data?: {
    fotoPerfil?: string
    photoUrl?: string
    url?: string
    usuario?: {
      fotoPerfil?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

/**
 * Servicio para actualizar la foto de perfil de un usuario
 */
export const updateUserProfilePhoto = async (
  userId: string | number,
  photoFile: File
): Promise<UpdatePhotoResponse> => {
  const token = getAuthToken()

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  // Validar archivo
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(photoFile.type)) {
    throw new Error(
      "Formato de imagen no válido. Use jpg, jpeg, png, gif o webp"
    )
  }

  if (photoFile.size > maxSize) {
    throw new Error("La imagen no puede superar los 5MB")
  }

  // Crear FormData
  const formData = new FormData()
  formData.append("foto", photoFile)

  console.log("📤 service-photo: Enviando petición", {
    userId,
    fileName: photoFile.name,
    fileSize: photoFile.size,
    fileType: photoFile.type,
    url: `${API_BASE_URL}/apa/usuarios/foto-perfil/${userId}`,
  })

  try {
    const response = await fetch(
      `${API_BASE_URL}/apa/usuarios/foto-perfil/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    console.log("📥 service-photo: Response status:", response.status)
    console.log(
      "📥 service-photo: Response headers:",
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("❌ service-photo: Error response:", errorData)
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()

    console.log(
      "✅ service-photo: Respuesta completa del backend:",
      JSON.stringify(data, null, 2)
    )
    console.log("📸 service-photo: data.data:", data.data)
    console.log("🖼️ service-photo: Posibles URLs:", {
      fotoPerfil: data.data?.fotoPerfil,
      photoUrl: data.data?.photoUrl,
      url: data.data?.url,
      usuarioFotoPerfil: data.data?.usuario?.fotoPerfil,
      directData: data.fotoPerfil,
    })

    return data
  } catch (error) {
    console.error("❌ service-photo: Error actualizando foto de perfil:", error)
    throw error
  }
}
