/* eslint-disable @typescript-eslint/no-explicit-any */
// services/plazaService.ts

import { ApiError, Plaza, Reserva } from "../types/table-reservas"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://kns.aparcoyo.com"

// Headers básicos
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
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

class PlazaService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        Accept: "*/*",
        ...getHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(30000),
      ...options,
    }

    console.log(`🔄 Haciendo request a: ${API_BASE_URL}${endpoint}`)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    console.log(
      `📡 Respuesta del servidor:`,
      response.status,
      response.statusText
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error HTTP ${response.status}:`, errorText)

      const errorData: ApiError = {
        statusCode: response.status,
        message:
          errorText || `HTTP Error: ${response.status} ${response.statusText}`,
      }
      throw errorData
    }

    const result = await response.json()
    console.log(
      `✅ Datos recibidos completos:`,
      JSON.stringify(result, null, 2)
    )
    return result
  }

  /**
   * 🔥 Función auxiliar para mapear reservas del backend a nuestro formato
   */
  /**
   * 🔥 Función auxiliar para mapear reservas del backend a nuestro formato
   */
  private mapReservaFromBackend(reservaBackend: any, index: number): Reserva {
    // 🔍 LOG PARA DEPURAR - ver qué campos tiene la reserva
    console.log(`📋 Reserva raw del backend [${index}]:`, reservaBackend)
    console.log(`🔑 ID de reserva:`, reservaBackend.id)
    console.log(`🔑 Campos disponibles:`, Object.keys(reservaBackend))

    // Extraer fechas del objeto anidado
    const fechaInicio = reservaBackend.fechaReserva?.inicio || ""
    const fechaFin = reservaBackend.fechaReserva?.fin || ""

    // Parsear la fecha de inicio para obtener fecha y hora
    const parseDateTime = (dateStr: string) => {
      // Formato: "oct 14, 2025 - 4:13AM"
      const parts = dateStr.split(" - ")
      return {
        fecha: parts[0] || dateStr,
        hora: parts[1] || "",
      }
    }

    const inicio = parseDateTime(fechaInicio)
    const fin = parseDateTime(fechaFin)

    // Limpiar el precio (quitar el símbolo €)
    const limpiarPrecio = (precioStr: string): number => {
      if (!precioStr) return 0
      const numero = precioStr.replace(/[€$,]/g, "").trim()
      return parseFloat(numero) || 0
    }

    // 🔥 IMPORTANTE: Buscar el ID real en diferentes campos posibles
    const reservaId =
      reservaBackend.id ||
      reservaBackend._id ||
      reservaBackend.reservaId ||
      reservaBackend.uid ||
      null

    // 🚨 Advertir si no hay ID válido
    if (!reservaId) {
      console.warn(
        `⚠️ Reserva sin ID válido en índice ${index}:`,
        reservaBackend
      )
    }

    return {
      id: reservaId || `temp-reserva-${index}-${Date.now()}`, // Solo usar temporal si NO hay ID
      usuario: {
        id: reservaBackend.usuarioId || reservaBackend.usuario?.id || "",
        nombre: reservaBackend.reservadoPor || "Sin nombre",
        email: reservaBackend.email || "",
        avatar: reservaBackend.avatar,
        iniciales:
          reservaBackend.iniciales ||
          reservaBackend.reservadoPor
            ?.split(" ")
            .map((p: string) => p[0])
            .join("")
            .toUpperCase()
            .substring(0, 2) ||
          "NN",
      },
      fechaConfirmacion: reservaBackend.fechaConfirmacion || "",
      estado:
        reservaBackend.estado === "pendiente"
          ? "programado"
          : (reservaBackend.estado as "programado" | "concluida" | "cancelada"),
      fechaReserva: inicio.fecha,
      horaInicio: inicio.hora,
      horaFin: fin.hora,
      precio: limpiarPrecio(reservaBackend.pagado),
      comision: limpiarPrecio(reservaBackend.comision),
      plazaId: reservaBackend.plazaId || "",
      createdAt: reservaBackend.createdAt,
      updatedAt: reservaBackend.updatedAt,
    }
  }

  /**
   * 🔥 CORREGIDO: Obtener plaza por ID CON sus reservas
   */
  async getPlazaById(plazaId: string): Promise<Plaza> {
    try {
      console.log(`🔍 Obteniendo plaza con ID: ${plazaId}`)

      // 1️⃣ Obtener datos básicos de la plaza
      const plazaResult = await this.makeRequest<any>(`/apa/plazas/${plazaId}`)
      const plazaData = plazaResult.data || plazaResult

      console.log(`✅ Plaza básica obtenida:`, plazaData)

      // 2️⃣ Obtener reservas con el formato correcto del backend
      let reservas: Reserva[] = []

      try {
        console.log(`🔍 Obteniendo reservas para plaza: ${plazaId}`)

        const reservasResult = await this.makeRequest<any>(
          `/apa/reservas/plaza/${plazaId}?_t=${Date.now()}`
        )

        console.log(`📊 Estructura de respuesta de reservas:`, reservasResult)

        // 🔥 NUEVO: Manejar la estructura real del backend
        // { ok: true, data: { totalReservas: 1, plaza: {...}, reservas: [...] } }
        let reservasBackend: any[] = []

        if (reservasResult.ok && reservasResult.data) {
          // Verificar si las reservas están dentro de data.reservas
          if (Array.isArray(reservasResult.data.reservas)) {
            reservasBackend = reservasResult.data.reservas
          } else if (Array.isArray(reservasResult.data)) {
            reservasBackend = reservasResult.data
          }
        } else if (Array.isArray(reservasResult)) {
          reservasBackend = reservasResult
        }

        console.log(`📋 Reservas en bruto del backend:`, reservasBackend)

        // 🔥 Mapear cada reserva al formato esperado
        reservas = reservasBackend.map((r, index) =>
          this.mapReservaFromBackend(r, index)
        )

        console.log(`✅ Reservas mapeadas: ${reservas.length}`)

        if (reservas.length > 0) {
          console.log(`🔍 Primera reserva mapeada:`, reservas[0])
        }
      } catch (error) {
        console.warn(`⚠️ No se pudieron obtener reservas:`, error)
        reservas = []
      }

      // 3️⃣ Mapear plaza con todos los campos
      const plaza: Plaza = {
        id: plazaData.id || plazaId,
        nombre: plazaData.nombre || "Sin nombre",
        precio: plazaData.precio || 0,
        disponible: plazaData.disponible ?? true,
        usuarioId: plazaData.propietario?.uid || plazaData.usuarioId || "",
        createdAt: plazaData.createdAt || new Date().toISOString(),
        updatedAt: plazaData.updatedAt || new Date().toISOString(),

        descripcion: plazaData.descripcion,
        tipo: plazaData.tipo || "Privada",
        ubicacion: plazaData.ubicacion,
        direccion: plazaData.direccion || plazaData.ubicacion,
        lat: plazaData.lat,
        lng: plazaData.lng,
        isActive: plazaData.isActive ?? true,
        disponibilidadDesde: plazaData.disponibilidadDesde,
        disponibilidadHasta: plazaData.disponibilidadHasta,

        reservas: reservas, // 🔥 Reservas ya mapeadas
        img: plazaData.img || plazaData.archivos || [],
        archivos: plazaData.archivos || plazaData.img || [],
        propietario: plazaData.propietario,
        reseñas: plazaData.resenas || plazaData.reseñas || [],
        cantidadResenas: plazaData.cantidadResenas || 0,
        rating: plazaData.rating || 0,
      }

      console.log(`✅ Plaza completa armada con ${reservas.length} reservas`)

      return plaza
    } catch (error) {
      console.error("❌ Error obteniendo plaza:", error)
      throw error
    }
  }

  /**
   * 🔥 NUEVO: Obtener solo las reservas de una plaza
   */
  async getReservasByPlaza(plazaId: string): Promise<Reserva[]> {
    try {
      console.log(`🔍 Obteniendo reservas para plaza: ${plazaId}`)

      const result = await this.makeRequest<any>(
        `/apa/reservas/plaza/${plazaId}?_t=${Date.now()}`
      )

      let reservasBackend: any[] = []

      if (result.ok && result.data) {
        if (Array.isArray(result.data.reservas)) {
          reservasBackend = result.data.reservas
        } else if (Array.isArray(result.data)) {
          reservasBackend = result.data
        }
      } else if (Array.isArray(result)) {
        reservasBackend = result
      }

      const reservas = reservasBackend.map((r, index) =>
        this.mapReservaFromBackend(r, index)
      )

      console.log(`✅ ${reservas.length} reservas obtenidas y mapeadas`)
      return reservas
    } catch (error) {
      console.error("❌ Error obteniendo reservas:", error)
      throw error
    }
  }

  async getAllPlazas(): Promise<Plaza[]> {
    const response = await this.makeRequest<{ data: Plaza[] }>("/apa/plazas")
    return response.data
  }

  async updateReserva(
    reservaId: string,
    updates: Partial<Reserva>
  ): Promise<Reserva> {
    console.log(`🔄 Actualizando reserva ${reservaId}:`, updates)

    const response = await this.makeRequest<{ data: Reserva }>(
      `/apa/reservas/${reservaId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    )

    console.log(`✅ Reserva actualizada`)
    return response.data
  }

  /**
   * Eliminar una reserva
   */
  async deleteReserva(reservaId: string): Promise<void> {
    // 🔥 Validar que sea un UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(reservaId)) {
      console.error(`❌ ID inválido para eliminar: ${reservaId}`)
      throw new Error(
        `No se puede eliminar esta reserva. ID inválido: ${reservaId}`
      )
    }

    console.log(`🔄 Eliminando reserva con ID: ${reservaId}`)

    await this.makeRequest(`/apa/reservas/${reservaId}`, {
      method: "DELETE",
    })

    console.log(`✅ Reserva eliminada`)
  }

  async updatePlaza(plazaId: string, updates: Partial<Plaza>): Promise<Plaza> {
    const response = await this.makeRequest<{ data: Plaza }>(
      `/apa/plazas/${plazaId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    )
    return response.data
  }
}

export const plazaService = new PlazaService()

export const plazaApi = {
  getById: (id: string) => plazaService.getPlazaById(id),
  getAll: () => plazaService.getAllPlazas(),
  getReservasByPlaza: (id: string) => plazaService.getReservasByPlaza(id),
  updateReserva: (id: string, data: Partial<Reserva>) =>
    plazaService.updateReserva(id, data),
  deleteReserva: (id: string) => plazaService.deleteReserva(id),
  updatePlaza: (id: string, data: Partial<Plaza>) =>
    plazaService.updatePlaza(id, data),
}
