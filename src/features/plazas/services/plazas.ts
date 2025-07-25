import axios from "axios";
import { PlazasResponse } from "../types";

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/plazas";

export const getAllPlazasService = () => {
  return axios.get<PlazasResponse>(`${BASE_URL}`);
};
