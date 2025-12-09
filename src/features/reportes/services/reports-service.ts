/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReportesCategoriasResponse,
  ReportesResponse,
} from "../types/reports-table"

const BASE_URL = "https://kns.aparcoyo.com"

class ReportesError extends Error {
  public code?: string
  public status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = "ReportesError"
    this.code = code
    this.status = status
  }
}

export class ReportesService {
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

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = this.getAuthToken()

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new ReportesError(
          `Error ${response.status}: ${response.statusText}`,
          response.status.toString(),
          response.status
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ReportesError) {
        throw error
      }

      throw new ReportesError(
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener reportes"
      )
    }
  }

  // ✨ FUNCIÓN ACTUALIZADA - ahora usa fechaDesde y fechaHasta
  static async getSummary(
    filtroFecha?: string,
    tipoReporte?: string
  ): Promise<ReportesResponse> {
    const params = new URLSearchParams()

    // ✅ NUEVO: Calcular fechas según el filtro
    if (filtroFecha) {
      const now = new Date()
      let fechaDesde: Date

      switch (filtroFecha) {
        case "dia":
          // Últimas 24 horas
          fechaDesde = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case "semana":
          // Últimos 7 días
          fechaDesde = new Date(now)
          fechaDesde.setDate(now.getDate() - 7)
          break
        case "mes":
          // Últimos 30 días
          fechaDesde = new Date(now)
          fechaDesde.setDate(now.getDate() - 30)
          break
        default:
          fechaDesde = new Date(now)
          fechaDesde.setDate(now.getDate() - 30)
      }

      // Formatear a ISO 8601
      params.append("fechaDesde", fechaDesde.toISOString())
      params.append("fechaHasta", now.toISOString())
    }

    if (tipoReporte) params.append("tipoReporte", tipoReporte)

    const queryString = params.toString()
    const endpoint = `/apa/reportes/summary${
      queryString ? `?${queryString}` : ""
    }`

    console.log("🔍 Llamando endpoint:", endpoint)

    return this.makeRequest<ReportesResponse>(endpoint, {
      method: "GET",
    })
  }

  // Método para obtener categorías
  static async getCategorias(): Promise<ReportesCategoriasResponse> {
    return this.makeRequest<ReportesCategoriasResponse>(
      "/apa/reportes/categorias",
      {
        method: "GET",
      }
    )
  }

  // Método para obtener un reporte específico por ID (para el modal)
  static async getReporteById(
    id: string
  ): Promise<{ ok: boolean; data: any; msg: string }> {
    return this.makeRequest(`/apa/reportes/${id}`, {
      method: "GET",
    })
  }

  // Método para actualizar un reporte (PATCH)
  static async updateReporte(
    id: string,
    data: { respuestaAdmin?: string; estado?: string }
  ): Promise<{ ok: boolean; data: any; msg: string }> {
    return this.makeRequest(`/apa/reportes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }
}
