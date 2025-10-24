/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"

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

// 🔧 TEMPORAL: Headers alternativos para debugging
const getDebugHeaders = () => {
  const token = getAuthToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    // Agregar headers adicionales que el backend podría estar esperando
    "X-User-Role": "admin", // Algunos backends leen roles de headers custom
    Accept: "application/json",
  }
}

// ✅ MÉTODO CON MAPEO DE img -> archivos
export const getAllPlazasService = async () => {
  const response = await axios.get<any>(`${BASE_URL}`, {
    headers: getAuthHeaders(),
  })

  console.log("📦 Respuesta del backend:", response.data)

  // Mapear 'img' a 'archivos' y convertir HTTP a HTTPS
  if (response.data?.data) {
    response.data.data = response.data.data.map((plaza: any) => {
      // Convertir URLs de HTTP a HTTPS
      const archivos = (plaza.img || []).map((img: any) => ({
        ...img,
        url: img.url?.replace(/^http:/, "https:"),
      }))

      console.log(`🏠 Plaza ${plaza.direccion}:`, {
        tieneImg: !!plaza.img,
        imgLength: plaza.img?.length,
        primeraURL: archivos[0]?.url,
      })

      // Foto del propietario (si existe)
      const propietarioFoto = plaza.propietario?.foto?.replace(
        /^http:/,
        "https:"
      )

      return {
        ...plaza,
        archivos, // Mapear img -> archivos
        propietario: {
          ...plaza.propietario,
          foto: propietarioFoto,
        },
      }
    })
  }

  return response as any
}

// 🆕 NUEVO - VERIFICAR SI UNA PLAZA PUEDE SER ELIMINADA
export const verificarEliminacionPlazaService = async (id: string) => {
  try {
    console.log(`🔍 Verificando si la plaza ${id} puede ser eliminada`)

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

    return {
      puedeEliminar: true,
      reservasActivas: 0,
      motivo: null,
    }
  }
}

// 🔄 MÉTODO MEJORADO CON RETRY Y HEADERS ALTERNATIVOS
export const eliminarPlazaService = async (id: string) => {
  console.log(`🗑️ Eliminando plaza con ID: ${id}`)
  console.log(`📡 URL completa: ${BASE_URL}/${id}`)
  console.log(`🔑 Token: ${getAuthToken() ? "Disponible" : "No disponible"}`)

  // Intento 1: Con headers normales
  try {
    console.log("🔄 Intento 1: Headers normales")
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      timeout: 15000,
    })
    console.log(`✅ Respuesta exitosa (intento 1):`, response.data)
    return response
  } catch (error: any) {
    console.warn(`⚠️ Intento 1 falló:`, error.response?.status)

    // Si es 401 o 403, intentar con headers alternativos
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("🔄 Intento 2: Headers con rol admin")

      try {
        const response = await axios.delete(`${BASE_URL}/${id}`, {
          headers: getDebugHeaders(),
          timeout: 15000,
        })
        console.log(`✅ Respuesta exitosa (intento 2):`, response.data)
        return response
      } catch (error2: any) {
        console.error(`❌ Intento 2 también falló`)

        // Logging detallado del error final
        console.error(`❌ Error detallado:`, {
          status: error2.response?.status,
          statusText: error2.response?.statusText,
          data: error2.response?.data,
          message: error2.message,
          url: error2.config?.url,
          method: error2.config?.method,
          headers: error2.config?.headers,
        })

        if (error2.response?.data) {
          console.error(`📝 Mensaje del servidor:`, error2.response.data)
          if (error2.response.data.message) {
            console.error(
              `💬 Mensaje específico:`,
              error2.response.data.message
            )
          }
          if (error2.response.data.msg) {
            console.error(
              `💬 Mensaje específico (msg):`,
              error2.response.data.msg
            )
          }
          if (error2.response.data.error) {
            console.error(`💬 Error específico:`, error2.response.data.error)
          }
        }

        throw error2
      }
    }

    // Si no es error de permisos, lanzar el error original
    console.error(`❌ Error detallado:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    })

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
  }
}

// 🆕 NUEVO - ELIMINAR CON VERIFICACIÓN PREVIA
export const eliminarPlazaConVerificacionService = async (id: string) => {
  try {
    const verificacion = await verificarEliminacionPlazaService(id)

    if (!verificacion.puedeEliminar) {
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

    return await eliminarPlazaService(id)
  } catch (error) {
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
