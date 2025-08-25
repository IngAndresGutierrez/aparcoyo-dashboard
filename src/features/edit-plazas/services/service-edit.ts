/* eslint-disable @typescript-eslint/no-explicit-any */
// services/modal-plaza.service.ts - VERSIÓN FINAL CORREGIDA

import { ActualizarPlazaModal, PlazaModal } from "../types/edit-plazas"

interface PlazaModalError {
  ok: false
  error: string
  message: string
  statusCode: number
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://aparcoyo-back.onrender.com"

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return (
    localStorage.getItem("authToken") || localStorage.getItem("token") || null
  )
}

export const modalPlazaService = {
  /**
   * Obtener datos de una plaza específica
   */
  async obtenerPlaza(id: string): Promise<PlazaModal> {
    try {
      const url = `${API_BASE_URL}/apa/plazas/${id}`
      console.log(`🔄 Obteniendo plaza: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      })

      console.log(
        `📡 Respuesta del servidor:`,
        response.status,
        response.statusText
      )

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          const errorData: PlazaModalError = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // Si no puede parsear el JSON, usar mensaje por defecto
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      const data = result.data || result

      console.log(`✅ Datos recibidos:`, data)

      const plazaData: PlazaModal = {
        id: data.id || id,
        nombre: data.nombre || "Sin nombre",
        descripcion: data.descripcion || "",
        tipo: data.tipo || "Publica",
        direccion: data.direccion || "",
        lat: data.lat || 0,
        lng: data.lng || 0,
        precio: data.precio || "0",
        
        propietario: {
          uid: data.propietario?.uid || "",
          nombre: data.propietario?.nombre || "Sin nombre",
          email: data.propietario?.email || "",
          
        },
        resenas: data.resenas || [],
        cantidadResenas: data.cantidadResenas || 0,
        rating: data.rating || 0,
        
      }

      return plazaData
    } catch (error) {
      console.error("❌ Error obteniendo plaza:", error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error("Error desconocido al obtener la plaza")
    }
  },

  /**
   * 🛠️ MÉTODO SIMPLIFICADO - SOLO ACTUALIZA, NO OBTIENE DATOS FRESCOS
   */
  async actualizarPlaza(
    id: string,
    datos: ActualizarPlazaModal
  ): Promise<PlazaModal> {
    try {
      const url = `${API_BASE_URL}/apa/plazas/${id}`

      console.log("🔍 ======== ACTUALIZACIÓN PLAZA SIMPLIFICADA ========")
      console.log(`🔄 URL: ${url}`)
      console.log(`📤 Datos a actualizar:`, datos)

      // 🛠️ SOLO ENVIAR LOS CAMPOS QUE EL BACKEND ACEPTA
      const datosLimpios = {
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || "",
        precio: Number(datos.precio), // El backend espera número
      }

      // Validaciones
      if (!datosLimpios.nombre || datosLimpios.nombre.length === 0) {
        throw new Error("El nombre es requerido")
      }

      if (isNaN(datosLimpios.precio) || datosLimpios.precio <= 0) {
        throw new Error("El precio debe ser un número válido mayor a 0")
      }

      if (datosLimpios.nombre.length > 100) {
        throw new Error("El nombre no puede tener más de 100 caracteres")
      }

      if (datosLimpios.descripcion.length > 500) {
        throw new Error("La descripción no puede tener más de 500 caracteres")
      }

      console.log(
        "🔍 Datos finales enviados al backend:",
        JSON.stringify(datosLimpios, null, 2)
      )

      const response = await fetch(url, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(datosLimpios),
      })

      console.log(`📡 Status: ${response.status}`)

      const responseText = await response.text()
      console.log(`📄 Response body:`, responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = responseText ? JSON.parse(responseText) : {}
        } catch {
          errorData = { message: responseText }
        }

        console.error(`❌ Error ${response.status}:`, errorData)

        if (response.status === 400) {
          const mensaje =
            errorData.message || errorData.error || `Error 400: Bad Request`
          throw new Error(`Datos inválidos: ${mensaje}`)
        } else if (response.status === 401) {
          throw new Error("No autorizado. Verifica tu token de autenticación.")
        } else if (response.status === 404) {
          throw new Error("Plaza no encontrada")
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para editar esta plaza")
        } else {
          throw new Error(
            `Error ${response.status}: ${errorData.message || responseText}`
          )
        }
      }

      // ✅ ÉXITO - CONSTRUIR RESPUESTA MÍNIMA
      const result = responseText ? JSON.parse(responseText) : {}
      const data = result.data || result

      console.log(`✅ Respuesta del backend:`, data)

      // 🛠️ DEVOLVER ESTRUCTURA MÍNIMA - EL HOOK SE ENCARGA DEL PROPIETARIO
      const plazaActualizada: PlazaModal = {
        id: data.id || id,
        nombre: data.nombre || datos.nombre,
        descripcion: data.descripcion || datos.descripcion,
        tipo: data.tipo || "Publica",
        direccion: data.direccion || "",
        lat: data.lat || 0,
        lng: data.lng || 0,
        precio: data.precio?.toString() || datos.precio,

        // 🛠️ PROPIETARIO VACÍO - EL HOOK LO RELLENARÁ CORRECTAMENTE
        // No intentamos preservar nada aquí, dejamos que el hook se encargue
        propietario: {
          uid: "", // El hook lo rellenará con formData.propietario.id
          nombre: "", // El hook lo rellenará con formData.propietario.nombre
          email: "", // El hook lo rellenará con formData.propietario.email
        },

        resenas: data.resenas || [],
        cantidadResenas: data.cantidadResenas || 0,
        rating: data.rating || 0,
      }

      console.log(
        "✅ Plaza preparada para el hook (propietario vacío intencionalmente):",
        plazaActualizada
      )

      return plazaActualizada
    } catch (error) {
      console.error("❌ Error actualizando plaza:", error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error("Error desconocido al actualizar la plaza")
    }
  },

  /**
   * Verificar conectividad con el backend
   */
  async verificarConexion(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/health`
      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      })

      return response.ok
    } catch {
      return false
    }
  },
}

export default modalPlazaService
