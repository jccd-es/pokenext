import Image from "next/image";
import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Pokemon } from "@/types/pokemon";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function PokemonListItem({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Item variant="outline" asChild role="listitem">
      <Link href={`/pokemon/${pokemon.id}`}>
        <ItemMedia variant="image">
          <Image
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            width={32}
            height={32}
            className="object-cover"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {capitalize(pokemon.name)} —{" "}
            <span className="text-muted-foreground">{pokemon.generation}</span>
          </ItemTitle>
          <ItemDescription className="flex flex-wrap gap-1">
            {pokemon.types.map((type) => (
              <Badge key={type.type.name} className="capitalize">
                {type.type.name}
              </Badge>
            ))}
          </ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  );
}
