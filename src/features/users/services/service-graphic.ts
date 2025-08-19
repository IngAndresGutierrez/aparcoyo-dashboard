// ============================================
// 📁 services/usuariosService.ts - VERSIÓN CORREGIDA
// ============================================

import {
  RangoEstadisticas,
  UsuarioEstadisticasResponse,
} from "../types/graphic"

// Configuración del API - URL de Render
const API_BASE_URL = "https://aparcoyo-back.onrender.com"

export class UsuariosService {
  /**
   * Obtiene el token de autenticación desde localStorage o donde lo tengas guardado
   * @returns string | null
   */
  private static getAuthToken(): string | null {
    // OPCIÓN 1: Si usas localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || localStorage.getItem("token")
    }

    // OPCIÓN 2: Si usas cookies
    // return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || null

    // OPCIÓN 3: Si tienes el token en otro lugar, agrégalo aquí
    return null
  }

  /**
   * Obtiene estadísticas de usuarios según el rango especificado
   * @param rango - Período de tiempo: "dia", "semana" o "mes"
   * @returns Promise con las estadísticas de usuarios
   */
  static async getEstadisticas(
    rango: RangoEstadisticas
  ): Promise<UsuarioEstadisticasResponse> {
    const url = `${API_BASE_URL}/apa/usuarios/estadisticas?rango=${rango}`
    const token = this.getAuthToken()

    console.log(`🔗 Intentando conectar a: ${url}`) // Debug log
    console.log(`🔑 Token disponible: ${token ? "Sí" : "No"}`) // Debug log

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      // Agregar token de autorización si está disponible
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        // Agregar timeout
        signal: AbortSignal.timeout(30000), // 30 segundos para Render cold start
      })

      console.log(`📡 Response status: ${response.status}`) // Debug log

      if (response.status === 401) {
        throw new Error("No autorizado. Verifica tu token de autenticación.")
      }

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        )
      }

      const data: UsuarioEstadisticasResponse = await response.json()

      console.log(`✅ Datos recibidos:`, data) // Debug log

      if (!data.ok) {
        // ← CORREGIDO: usa 'ok' en lugar de 'success'
        throw new Error(data.msg || "Error al obtener estadísticas de usuarios")
      }

      return data
    } catch (error) {
      console.error(`❌ Error en UsuariosService.getEstadisticas:`, error)

      // Manejo específico de errores de conexión
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend esté corriendo en: ${API_BASE_URL}`
        )
      }

      // Re-lanzar otros errores
      throw error
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/apa/usuarios/estadisticas?rango=mes`,
        {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5 segundos timeout
        }
      )
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Obtener la URL base actual del API
   * @returns string
   */
  static getApiBaseUrl(): string {
    return API_BASE_URL
  }
}
