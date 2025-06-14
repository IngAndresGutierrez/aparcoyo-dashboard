import PokemonCard from "../PokemonCard";
import { Pokemon } from "../../types/pokemons";
import { useGetPokemons } from "../../hooks/useGetpokemons";

const PokemonsList = () => {
  const { pokemons, loading, error } = useGetPokemons();

  return (
    <div>
      <h1>PokemonsList</h1>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div className="grid grid-cols-1 gap-4">
        {pokemons.map((pokemon: Pokemon) => (
          <PokemonCard key={pokemon.name} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
};

export default PokemonsList;
