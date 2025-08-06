// import axios from "axios";
// import { PlazasResponse } from "../types";

// const BASE_URL = "https://aparcoyo-back.onrender.com/apa/plazas";

// export const getAllPlazasService = () => {
//   return axios.get<PlazasResponse>(`${BASE_URL}`);
// };

import axios from "axios"
import { PlazasResponse } from "../types"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/plazas"

export const getAllPlazasService = () => {
  const token = localStorage.getItem("token") // o tu método de obtener el token

  return axios.get<PlazasResponse>(`${BASE_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
