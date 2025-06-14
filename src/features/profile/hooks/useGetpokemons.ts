import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";

import { getPokemons } from "../services/pokemons";

export const useGetPokemons = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = useSelector((state: RootState) => state.counter.value);

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
  }, [count]);

  return { pokemons, loading, error, getPokemonsService };
};
