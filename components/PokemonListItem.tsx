"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pokemon } from "@/types/pokemon";
import {
  capitalize,
  formatHeight,
  formatWeight,
  TYPE_COLORS,
} from "@/lib/pokemon-utils";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  pokemon: Pokemon;
  searchParams?: URLSearchParams;
};

export function PokemonListItem({ pokemon, searchParams }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const language = searchParams?.get("language") ?? undefined;
  const t = useTranslations(language);
  const query = searchParams?.toString();
  
  let href = `/pokemon/${pokemon.id}`;
  const params = new URLSearchParams();
  if (query) params.set("from", query);
  if (language) params.set("language", language);
  if (params.toString()) href += `?${params.toString()}`;

  return (
    <Card className="hover:shadow-md transition-shadow py-0" role="listitem">
      <Link href={href}>
        <CardContent className="flex items-center gap-4 px-4 py-3">
          <div className="relative w-20 h-20 flex-shrink-0">
            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/pokeball.svg"
                  alt={pokemon.name}
                  width={32}
                  height={32}
                  className="opacity-50"
                />
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/pokeball.svg"
                      alt="Loading"
                      width={32}
                      height={32}
                      className="opacity-30 animate-pulse"
                    />
                  </div>
                )}
                <Image
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  width={80}
                  height={80}
                  className="object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base capitalize line-clamp-1">
                {capitalize(pokemon.name)}
              </h3>
              {pokemon.evolvesFromName && (
                <span className="text-xs text-muted-foreground italic">
                  {capitalize(pokemon.evolvesFromName)}
                  {t.pokemon.evolution}
                </span>
              )}
              {pokemon.isLegendary && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600">
                  {t.pokemon.legendary}
                </Badge>
              )}
              {pokemon.isMythical && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-400 text-purple-600">
                  {t.pokemon.mythical}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              {pokemon.types.map((type) => {
                const colors = TYPE_COLORS[type.type.name];
                return (
                  <Badge
                    key={type.type.name}
                    className={`capitalize text-xs ${colors?.bg ?? ""} ${colors?.text ?? ""}`}
                  >
                    {type.type.localizedName ?? type.type.name}
                  </Badge>
                );
              })}
            </div>

            {pokemon.flavorText && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {pokemon.flavorText}
              </p>
            )}
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 text-[11px] text-muted-foreground shrink-0">
            <span>{pokemon.generation}</span>
            <span>{formatHeight(pokemon.height)}</span>
            <span>{formatWeight(pokemon.weight)}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
