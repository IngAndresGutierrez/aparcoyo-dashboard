import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pokemon } from "../../types/pokemons";

const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{pokemon.name}</CardTitle>
        <CardDescription>{pokemon.name}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};

export default PokemonCard;
