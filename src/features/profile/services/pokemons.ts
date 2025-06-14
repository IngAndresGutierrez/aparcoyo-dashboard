import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2";

export const getPokemons = async () => {
  const response = await axios.get(`${BASE_URL}/pokemon?limit=50&offset=0`);

  return response.data;
};
