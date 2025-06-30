import axios from "axios"

export const googleLoginService = () => {
  return axios.get("https://aparcoyo-back.onrender.com/apa/auth/google")
}
