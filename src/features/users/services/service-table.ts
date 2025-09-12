/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  UsuarioTabla,
  UsuariosTablaParams,
  UsuariosTablaResponse,
  UsuariosEstadisticasResponse,
} from "../types/table"

const API_BASE_URL = "https://aparcoyo-back.onrender.com"

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

// 🔥 NUEVA FUNCIÓN: Filtrar usuarios por rango de fechas
const filterUsuariosByDateRange = (
  usuarios: UsuarioTabla[],
  fechaInicio?: string,
  fechaFin?: string
): UsuarioTabla[] => {
  if (!fechaInicio || !fechaFin) {
    return usuarios // Si no hay filtros de fecha, devolver todos
  }

  const startDate = new Date(fechaInicio)
  const endDate = new Date(fechaFin)

  console.log(`🔍 Filtrando usuarios por fecha:`, {
    fechaInicio: startDate.toLocaleDateString(),
    fechaFin: endDate.toLocaleDateString(),
    totalUsuarios: usuarios.length,
  })

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!usuario.fechaRegistro) {
      console.log(`⚠️ Usuario sin fecha de registro: ${usuario.email}`)
      return false
    }

    const fechaUsuario = new Date(usuario.fechaRegistro)
    const enRango = fechaUsuario >= startDate && fechaUsuario <= endDate

    if (!enRango) {
      console.log(
        `📅 Usuario fuera del rango: ${
          usuario.email
        } - ${fechaUsuario.toLocaleDateString()}`
      )
    }

    return enRango
  })

  console.log(
    `✅ Usuarios filtrados: ${usuariosFiltrados.length} de ${usuarios.length}`
  )

  return usuariosFiltrados
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
   * 🛠️ MÉTODO PRINCIPAL ACTUALIZADO: Combina datos básicos + estadísticas + filtros de fecha
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

    // 🔥 EXTRAER filtros de fecha para procesarlos aparte
    const { fechaInicio, fechaFin, ...backendParams } = params

    if (fechaInicio && fechaFin) {
      console.log(`📅 Filtros de fecha detectados:`, {
        desde: new Date(fechaInicio).toLocaleDateString(),
        hasta: new Date(fechaFin).toLocaleDateString(),
      })
    }

    try {
      // 1️⃣ OBTENER DATOS BÁSICOS (con UIDs, isActive, rol, paginación)
      // 🔥 NO enviar filtros de fecha al backend (no los soporta)
      const basicQueryParams = new URLSearchParams()
      if (backendParams.page)
        basicQueryParams.append("page", backendParams.page.toString())
      if (backendParams.limit)
        basicQueryParams.append("limit", backendParams.limit.toString())
      if (backendParams.search)
        basicQueryParams.append("search", backendParams.search)
      if (backendParams.estado)
        basicQueryParams.append("estado", backendParams.estado)
      if (backendParams.sortBy)
        basicQueryParams.append("sortBy", backendParams.sortBy)
      if (backendParams.sortOrder)
        basicQueryParams.append("sortOrder", backendParams.sortOrder)

      // 🔥 IMPORTANTE: Si hay filtros de fecha, traer TODOS los usuarios para filtrar
      if (fechaInicio && fechaFin) {
        basicQueryParams.set("limit", "9999") // Traer todos los usuarios
        basicQueryParams.delete("page") // Sin paginación del backend
      }

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

      let statsData: UsuariosEstadisticasResponse | null = null

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
            fechaRegistro: stats?.fechaRegistro ?? "",
            reservasHechas: stats?.reservasHechas || 0,
            plazasPublicadas: stats?.plazasPublicadas || 0,
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

      // 4️⃣ 🔥 APLICAR FILTROS DE FECHA DEL LADO DEL CLIENTE
      let usuariosFinales = usuariosCombinados

      if (fechaInicio && fechaFin) {
        usuariosFinales = filterUsuariosByDateRange(
          usuariosCombinados,
          fechaInicio,
          fechaFin
        )
        console.log(
          `🔍 Después del filtro de fecha: ${usuariosFinales.length} usuarios`
        )
      }

      // 5️⃣ 🔥 APLICAR PAGINACIÓN DEL LADO DEL CLIENTE (si se filtraron por fecha)
      let usuariosPaginados = usuariosFinales
      let totalFinal = usuariosFinales.length
      let pageFinal = params.page || 1
      let limitFinal = params.limit || 10

      if (fechaInicio && fechaFin) {
        // Aplicar paginación manualmente
        const startIndex = (pageFinal - 1) * limitFinal
        const endIndex = startIndex + limitFinal
        usuariosPaginados = usuariosFinales.slice(startIndex, endIndex)

        console.log(
          `📄 Paginación aplicada: página ${pageFinal}, mostrando ${usuariosPaginados.length} de ${totalFinal}`
        )
      } else {
        // Usar paginación del backend
        totalFinal =
          statsData?.data?.usuariosTotales ||
          basicData.total ||
          usuariosCombinados.length
        pageFinal = basicData.page || params.page || 1
        limitFinal = basicData.limit || params.limit || 10
      }

      // Debug: mostrar ejemplo
      if (usuariosPaginados.length > 0) {
        console.log(`🔍 Ejemplo de usuario final:`, {
          email: usuariosPaginados[0].email,
          fechaRegistro: usuariosPaginados[0].fechaRegistro,
          reservasHechas: usuariosPaginados[0].reservasHechas,
          uid: usuariosPaginados[0].uid,
        })
      }

      return {
        ok: true,
        data: usuariosPaginados,
        msg:
          fechaInicio && fechaFin
            ? `Usuarios filtrados por fecha (${usuariosFinales.length} encontrados)`
            : statsData
            ? "Usuarios con estadísticas completas"
            : "Usuarios sin estadísticas",
        total: totalFinal,
        page: pageFinal,
        limit: limitFinal,
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
   * 🔥 NUEVO: Método auxiliar para obtener usuarios por rango
   */
  static async getUsuariosByRango(
    rango: "dia" | "semana" | "mes",
    additionalParams: Omit<UsuariosTablaParams, "fechaInicio" | "fechaFin"> = {}
  ): Promise<UsuariosTablaResponse> {
    const now = new Date()
    const startDate = new Date()

    switch (rango) {
      case "dia":
        startDate.setDate(now.getDate() - 1)
        break
      case "semana":
        startDate.setDate(now.getDate() - 7)
        break
      case "mes":
        startDate.setDate(now.getDate() - 30)
        break
    }

    console.log(`📅 Obteniendo usuarios por rango ${rango}:`, {
      desde: startDate.toLocaleDateString(),
      hasta: now.toLocaleDateString(),
    })

    return this.getUsuarios({
      ...additionalParams,
      fechaInicio: startDate.toISOString(),
      fechaFin: now.toISOString(),
    })
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

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        )
      }

      const data: UsuariosEstadisticasResponse = await response.json()

      if (!data.ok || !data.data || !data.data.usuarios) {
        throw new Error(data.msg || "Error al obtener estadísticas de usuarios")
      }

      // Convertir usuarios de estadísticas al formato de tabla
      const usuariosConvertidos: UsuarioTabla[] = data.data.usuarios.map(
        (usuario, index) => ({
          uid: `temp_${index}_${Date.now()}`,
          nombre: usuario.nombre,
          email: usuario.email,
          fechaRegistro: usuario.fechaRegistro,
          reservasHechas: usuario.reservasHechas,
          plazasPublicadas: usuario.plazasPublicadas,
          isActive: true,
          rol: "usuario" as any,
          totalReservas: usuario.reservasHechas,
          totalPlazas: usuario.plazasPublicadas,
        })
      )

      // 🔥 APLICAR FILTROS DE FECHA
      const { fechaInicio, fechaFin, ...otherParams } = params
      let usuariosFiltrados = usuariosConvertidos

      if (fechaInicio && fechaFin) {
        usuariosFiltrados = filterUsuariosByDateRange(
          usuariosConvertidos,
          fechaInicio,
          fechaFin
        )
      }

      // Aplicar otros filtros
      if (otherParams.search) {
        const searchTerm = otherParams.search.toLowerCase().trim()
        usuariosFiltrados = usuariosFiltrados.filter(
          (usuario) =>
            usuario.nombre.toLowerCase().includes(searchTerm) ||
            usuario.email.toLowerCase().includes(searchTerm)
        )
      }

      // Aplicar paginación
      const page = params.page || 1
      const limit = params.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const usuariosPaginados = usuariosFiltrados.slice(startIndex, endIndex)

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
      throw error
    }
  }

  /**
   * Obtiene un usuario específico por ID
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
