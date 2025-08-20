/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import { PlazasResponse } from "../types"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/plazas"

// Obtener token - función helper reutilizable
const getAuthToken = () => {
  return localStorage.getItem("token")
}

// Headers con autenticación - función helper
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// ✅ MÉTODO EXISTENTE
export const getAllPlazasService = () => {
  return axios.get<PlazasResponse>(`${BASE_URL}`, {
    headers: getAuthHeaders(),
  })
}

// 🆕 NUEVO MÉTODO - ELIMINAR PLAZA (CON DEBUGGING MEJORADO)
export const eliminarPlazaService = (id: string) => {
  console.log(`🗑️ Eliminando plaza con ID: ${id}`)
  console.log(`📡 URL completa: ${BASE_URL}/${id}`)
  console.log(`🔑 Token: ${getAuthToken() ? 'Disponible' : 'No disponible'}`)
  
  return axios.delete(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
    timeout: 15000, // 15 segundos timeout
  }).then(response => {
    console.log(`✅ Respuesta exitosa:`, response.data)
    return response
  }).catch(error => {
    console.error(`❌ Error detallado:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
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

// 🆕 OPCIONAL - OBTENER PLAZA POR ID (si lo necesitas)
export const getPlazaByIdService = (id: string) => {
  return axios.get(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
}

// 🆕 OPCIONAL - ACTUALIZAR PLAZA (si lo necesitas)
export const updatePlazaService = (id: string, data: any) => {
  return axios.put(`${BASE_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  })
}