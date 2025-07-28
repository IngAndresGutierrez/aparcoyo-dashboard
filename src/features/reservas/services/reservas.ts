import axios from "axios";
import { ReservasResponse } from "../types";

const BASE_URL = "https://aparcoyo-back.onrender.com/apa/reservas";

export const getAllReservasService = () => {
  return axios.get<ReservasResponse>(`${BASE_URL}`);
};
