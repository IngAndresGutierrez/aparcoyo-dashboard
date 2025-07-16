import axios from "axios"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/auth"

export const googleLoginService = () => {
  return axios.get(`${BASE_URL}/google`)
}

export const emailLoginService = (email: string, password: string) => {
  return axios.post(`${BASE_URL}/login`, {
    email,
    password,
  })
}
