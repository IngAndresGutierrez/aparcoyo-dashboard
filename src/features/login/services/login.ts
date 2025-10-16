import axios from "axios"

const BASE_URL = "https://kns.aparcoyo.com/apa/auth"

export const googleLoginService = () => {
  return axios.get(`${BASE_URL}/google`)
}

export const emailLoginService = (email: string, password: string) => {
  return axios.post(`${BASE_URL}/login`, {
    email,
    password,
  })
}

// 👇 Nueva función para manejar la autenticación completa
export const handleEmailLogin = async (email: string, password: string) => {
  try {
    const response = await emailLoginService(email, password)

    // Guardar token
    const token =
      response.data.token ||
      response.data.data?.token ||
      response.data.accessToken

    if (token) {
      localStorage.setItem("token", token)

      return { success: true, data: response.data }
    } else {
      console.error("❌ No se encontró token en la respuesta")
      return { success: false, error: "No se recibió token del servidor" }
    }
  } catch (error) {
    console.error("Error en login:", error)
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || "Error en el login",
      }
    }
    return { success: false, error: "Error en el login" }
  }
}
