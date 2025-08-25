/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UsuariosTablaParams,
  UsuariosTablaResponse,
  UsuarioTabla,
} from "../types/table"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

// 🛠️ Interface para la respuesta del endpoint de estadísticas
interface EstadisticasResponse {
  ok: boolean
  data: {
    usuariosNuevos: number
    usuariosConPlaza: number
    usuariosConReserva: number
    usuariosTotales: number
    periodoActual: number
    periodoAnterior: number
    usuarios: Array<{
      nombre: string
      email: string
      fechaRegistro: string
      reservasHechas: number
      plazasPublicadas: number
    }>
  }
  msg: string | null
}

// 🛠️ Interface para usuarios básicos (con UID)
interface UsuariosBasicosResponse {
  ok: boolean
  data: Array<{
    uid: string
    nombre: string
    email: string
    rol: string
    isActive: boolean
  }>
  msg: string | null
  total?: number
  page?: number
  limit?: number
}

export class UsuariosTablaService {
  /**
   * Obtiene el token de autenticación desde localStorage
   * @returns string | null
   */
  private static getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || localStorage.getItem("token")
    }
    return null
  }

  /**
   * 🛠️ MÉTODO PRINCIPAL ACTUALIZADO: Combina datos básicos + estadísticas
   * @param params - Parámetros de filtrado y paginación
   * @returns Promise con la lista de usuarios completa
   */
  static async getUsuarios(
    params: UsuariosTablaParams = {}
  ): Promise<UsuariosTablaResponse> {
    const token = this.getAuthToken()

    if (!token) {
      throw new Error("No hay token de autenticación disponible")
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    console.log(`🔗 Iniciando obtención de usuarios completos...`)
    console.log(`🔑 Token disponible: Sí`)

    try {
      // 1️⃣ OBTENER DATOS BÁSICOS (con UIDs, isActive, rol, paginación)
      const basicQueryParams = new URLSearchParams()
      if (params.page) basicQueryParams.append("page", params.page.toString())
      if (params.limit)
        basicQueryParams.append("limit", params.limit.toString())
      if (params.search) basicQueryParams.append("search", params.search)
      if (params.estado) basicQueryParams.append("estado", params.estado)
      if (params.sortBy) basicQueryParams.append("sortBy", params.sortBy)
      if (params.sortOrder)
        basicQueryParams.append("sortOrder", params.sortOrder)

      const basicUrl = `${API_BASE_URL}/apa/usuarios${
        basicQueryParams.toString() ? `?${basicQueryParams.toString()}` : ""
      }`

      console.log(`🔗 Obteniendo datos básicos: ${basicUrl}`)

      const basicResponse = await fetch(basicUrl, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      })

      console.log(`📡 Response status (básicos): ${basicResponse.status}`)

      if (!basicResponse.ok) {
        throw new Error(
          `Error al obtener usuarios básicos: ${basicResponse.status}`
        )
      }

      const basicData: UsuariosBasicosResponse = await basicResponse.json()

      if (!basicData.ok) {
        throw new Error(basicData.msg || "Error en datos básicos")
      }

      console.log(
        `✅ Datos básicos obtenidos: ${basicData.data.length} usuarios`
      )

      // 2️⃣ OBTENER ESTADÍSTICAS (con fechas, reservas, plazas)
      const statsUrl = `${API_BASE_URL}/apa/usuarios/estadisticas`

      console.log(`🔗 Obteniendo estadísticas: ${statsUrl}`)

      const statsResponse = await fetch(statsUrl, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      })

      console.log(`📡 Response status (estadísticas): ${statsResponse.status}`)

      let statsData: EstadisticasResponse | null = null

      if (statsResponse.ok) {
        statsData = await statsResponse.json()
        if (statsData?.ok && statsData?.data?.usuarios) {
          console.log(
            `✅ Estadísticas obtenidas: ${statsData.data.usuarios.length} usuarios con fechas`
          )
        } else {
          console.warn(`⚠️ Estadísticas sin datos válidos`)
          statsData = null
        }
      } else {
        console.warn(
          `⚠️ No se pudieron obtener estadísticas: ${statsResponse.status}`
        )
      }

      // 3️⃣ COMBINAR DATOS
      const usuariosCombinados: UsuarioTabla[] = basicData.data.map(
        (usuarioBasico) => {
          // Buscar estadísticas por email (solo si statsData existe)
          const stats = statsData?.data?.usuarios?.find(
            (stat) =>
              stat.email.toLowerCase() === usuarioBasico.email.toLowerCase()
          )

          const usuarioCompleto: UsuarioTabla = {
            uid: usuarioBasico.uid,
            nombre: usuarioBasico.nombre,
            email: usuarioBasico.email,
            rol: usuarioBasico.rol as any,
            isActive: usuarioBasico.isActive,
            fechaRegistro: stats?.fechaRegistro ?? "", // ← AQUÍ ESTÁ LA FECHA
            reservasHechas: stats?.reservasHechas || 0, // ← AQUÍ LAS RESERVAS
            plazasPublicadas: stats?.plazasPublicadas || 0, // ← AQUÍ LAS PLAZAS
            // Para compatibilidad con nombres anteriores:
            totalReservas: stats?.reservasHechas || 0,
            totalPlazas: stats?.plazasPublicadas || 0,
          }

          return usuarioCompleto
        }
      )

      console.log(
        `✅ Usuarios combinados exitosamente: ${usuariosCombinados.length}`
      )

      // Debug: mostrar ejemplo
      if (usuariosCombinados.length > 0) {
        console.log(`🔍 Ejemplo de usuario combinado:`, {
          email: usuariosCombinados[0].email,
          fechaRegistro: usuariosCombinados[0].fechaRegistro,
          reservasHechas: usuariosCombinados[0].reservasHechas,
          uid: usuariosCombinados[0].uid,
        })
      }

      return {
        ok: true,
        data: usuariosCombinados,
        msg: statsData
          ? "Usuarios con estadísticas completas"
          : "Usuarios sin estadísticas",
        total: basicData.total || usuariosCombinados.length,
        page: basicData.page || params.page || 1,
        limit: basicData.limit || params.limit || 10,
      }
    } catch (error) {
      console.error(`❌ Error en UsuariosTablaService.getUsuarios:`, error)

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend esté corriendo en: ${API_BASE_URL}`
        )
      }

      throw error
    }
  }

  /**
   * 🛠️ MÉTODO ALTERNATIVO: Solo endpoint de estadísticas (más simple)
   * Úsalo si el método principal tiene problemas
   */
  static async getUsuariosDesdeEstadisticas(
    params: UsuariosTablaParams = {}
  ): Promise<UsuariosTablaResponse> {
    const token = this.getAuthToken()

    if (!token) {
      throw new Error("No hay token de autenticación disponible")
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    const url = `${API_BASE_URL}/apa/usuarios/estadisticas`

    console.log(`🔗 Obteniendo usuarios desde estadísticas: ${url}`)
    console.log(`🔑 Token disponible: Sí`)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      })

      console.log(`📡 Response status: ${response.status}`)

      if (response.status === 401) {
        throw new Error("No autorizado. Verifica tu token de autenticación.")
      }

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        )
      }

      const data: EstadisticasResponse = await response.json()

      console.log(`✅ Estadísticas obtenidas:`, data)

      if (!data.ok || !data.data || !data.data.usuarios) {
        throw new Error(data.msg || "Error al obtener estadísticas de usuarios")
      }

      // Convertir usuarios de estadísticas al formato de tabla
      const usuariosConvertidos: UsuarioTabla[] = data.data.usuarios.map(
        (usuario, index) => ({
          uid: `temp_${index}_${Date.now()}`, // UID temporal
          nombre: usuario.nombre,
          email: usuario.email,
          fechaRegistro: usuario.fechaRegistro, // ← FECHA REAL
          reservasHechas: usuario.reservasHechas, // ← RESERVAS REALES
          plazasPublicadas: usuario.plazasPublicadas, // ← PLAZAS REALES
          isActive: true, // Por defecto (no disponible en estadísticas)
          rol: "usuario", // Por defecto (no disponible en estadísticas)
          // Para compatibilidad:
          totalReservas: usuario.reservasHechas,
          totalPlazas: usuario.plazasPublicadas,
        })
      )

      // Aplicar filtros en frontend (el endpoint de estadísticas puede no soportarlos)
      let usuariosFiltrados = usuariosConvertidos

      if (params.search) {
        const searchTerm = params.search.toLowerCase().trim()
        usuariosFiltrados = usuariosConvertidos.filter(
          (usuario) =>
            usuario.nombre.toLowerCase().includes(searchTerm) ||
            usuario.email.toLowerCase().includes(searchTerm)
        )
      }

      // Aplicar paginación en frontend
      const page = params.page || 1
      const limit = params.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const usuariosPaginados = usuariosFiltrados.slice(startIndex, endIndex)

      console.log(
        `✅ Usuarios procesados: ${usuariosPaginados.length} de ${usuariosFiltrados.length}`
      )

      return {
        ok: true,
        data: usuariosPaginados,
        msg: "Usuarios obtenidos desde estadísticas",
        total: usuariosFiltrados.length,
        page,
        limit,
      }
    } catch (error) {
      console.error(`❌ Error en getUsuariosDesdeEstadisticas:`, error)

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend esté corriendo en: ${API_BASE_URL}`
        )
      }

      throw error
    }
  }

  /**
   * Obtiene un usuario específico por ID
   * @param id - ID del usuario
   * @returns Promise con los datos del usuario
   */
  static async getUsuarioById(
    id: string
  ): Promise<{ ok: boolean; data: UsuarioTabla; msg: string }> {
    const token = this.getAuthToken()
    const url = `${API_BASE_URL}/apa/usuarios/${id}`

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(15000),
      })

      if (response.status === 401) {
        throw new Error("No autorizado.")
      }

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.msg || "Error al obtener usuario")
      }

      return data
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${id}:`, error)
      throw error
    }
  }
}
