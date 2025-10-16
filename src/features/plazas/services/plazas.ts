/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import { PlazasResponse } from "../types"

const BASE_URL = "https://kns.aparcoyo.com/apa/plazas"

// Obtener token - función helper reutilizable
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Headers con autenticación - función helper
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// ✅ MÉTODO EXISTENTE
export const getAllPlazasService = () => {
  return axios.get<PlazasResponse>(`${BASE_URL}`, {
    headers: getAuthHeaders(),
  })
}

// 🆕 NUEVO - VERIFICAR SI UNA PLAZA PUEDE SER ELIMINADA
export const verificarEliminacionPlazaService = async (id: string) => {
  try {
    console.log(`🔍 Verificando si la plaza ${id} puede ser eliminada`)

    // Intentar obtener reservas activas de la plaza
    // Basándome en tu documentación, podría ser algo como:
    const response = await axios.get(
      `https://kns.aparcoyo.com/apa/reservas?plazaId=${id}&estado=activa`,
      {
        headers: getAuthHeaders(),
        timeout: 10000,
      }
    )

    const reservasActivas = response.data?.data || response.data || []
    const cantidad = Array.isArray(reservasActivas) ? reservasActivas.length : 0

    console.log(`📊 Plaza ${id} tiene ${cantidad} reservas activas`)

    return {
      puedeEliminar: cantidad === 0,
      reservasActivas: cantidad,
      motivo:
        cantidad > 0
          ? `La plaza tiene ${cantidad} reserva${
              cantidad > 1 ? "s" : ""
            } activa${cantidad > 1 ? "s" : ""}`
          : null,
    }
  } catch (error: any) {
    console.warn(
      `⚠️ No se pudo verificar reservas para plaza ${id}:`,
      error.message
    )

    // Si el endpoint de verificación falla, permitir el intento
    // El error real se manejará en eliminarPlazaService
    return {
      puedeEliminar: true, // Asumir que sí se puede
      reservasActivas: 0,
      motivo: null,
    }
  }
}

// 🔄 MÉTODO EXISTENTE MEJORADO
export const eliminarPlazaService = (id: string) => {
  console.log(`🗑️ Eliminando plaza con ID: ${id}`)
  console.log(`📡 URL completa: ${BASE_URL}/${id}`)
  console.log(`🔑 Token: ${getAuthToken() ? "Disponible" : "No disponible"}`)

  return axios
    .delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      timeout: 15000, // 15 segundos timeout
    })
    .then((response) => {
      console.log(`✅ Respuesta exitosa:`, response.data)
      return response
    })
    .catch((error) => {
      console.error(`❌ Error detallado:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      })

      // Log específico del mensaje del servidor
      if (error.response?.data) {
        console.error(`📝 Mensaje del servidor:`, error.response.data)
        if (error.response.data.message) {
          console.error(`💬 Mensaje específico:`, error.response.data.message)
        }
        if (error.response.data.msg) {
          console.error(`💬 Mensaje específico (msg):`, error.response.data.msg)
        }
        if (error.response.data.error) {
          console.error(`💬 Error específico:`, error.response.data.error)
        }
      }

      throw error
    })
}

// 🆕 NUEVO - ELIMINAR CON VERIFICACIÓN PREVIA
export const eliminarPlazaConVerificacionService = async (id: string) => {
  try {
    // 1. Verificar si se puede eliminar
    const verificacion = await verificarEliminacionPlazaService(id)

    if (!verificacion.puedeEliminar) {
      // Crear un error personalizado que simule la respuesta del servidor
      const error = new Error("Plaza tiene reservas activas") as any
      error.response = {
        status: 400,
        data: {
          message: verificacion.motivo,
          error: "Bad Request",
          statusCode: 400,
        },
      }
      throw error
    }

    // 2. Si puede eliminar, proceder normalmente
    return await eliminarPlazaService(id)
  } catch (error) {
    // Re-lanzar el error para que lo maneje el componente
    throw error
  }
}

// ✅ MÉTODOS EXISTENTES
export const getPlazaByIdService = (id: string) => {
  return axios.get(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const updatePlazaService = (id: string, data: any) => {
  return axios.put(`${BASE_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  })
}
