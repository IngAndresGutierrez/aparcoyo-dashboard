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

// 🔄 MÉTODO EXISTENTE MEJORADO
export const eliminarPlazaService = (id: string) => {
  console.log(`🗑️ Eliminando plaza con ID: ${id}`)
  console.log(`📡 URL completa: ${BASE_URL}/${id}`)
  console.log(`🔑 Token: ${getAuthToken() ? "Disponible" : "No disponible"}`)

  return axios
    .delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      timeout: 15000,
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
