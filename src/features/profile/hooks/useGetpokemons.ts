import { useEffect, useState } from "react";

import { getPokemons } from "../services/pokemons";

export const useGetPokemons = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPokemonsService = async () => {
    setLoading(true);
    try {
      const response = await getPokemons();
      setPokemons(response.results);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPokemonsService();
  }, []);

  return { pokemons, loading, error, getPokemonsService };
};
