import axios from "axios";
import { ReservasResponse } from "../types";

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/reservas";

export const getAllReservasService = () => {
  // Obtén el token del localStorage
  const token = localStorage.getItem("token");
  
  return axios.get<ReservasResponse>(`${BASE_URL}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};








// import axios from "axios"
// import { ReservasResponse } from "../types"

// const BASE_URL = "https://aparcoyo-back.onrender.com/apa/reservas"

// export const getAllReservasService = () => {
//   console.log("🔍 Haciendo petición a:", BASE_URL)

//   return axios
//     .get<ReservasResponse>(`${BASE_URL}`)
//     .then((response) => {
//       console.log("✅ Respuesta completa:", response)
//       console.log("📊 Data:", response.data)
//       console.log("📈 Status:", response.status)
//       console.log("🔢 Headers:", response.headers)
//       return response
//     })
//     .catch((error) => {
//       console.error("❌ Error en la petición:", error)
//       console.error("📄 Error response:", error.response?.data)
//       console.error("🔢 Error status:", error.response?.status)
//       throw error
//     })
// }
