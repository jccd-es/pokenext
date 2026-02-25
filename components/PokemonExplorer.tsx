"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PokemonListItem } from "@/components/PokemonListItem";
import { PokemonPagination } from "@/components/PokemonPagination";
import { cn } from "@/lib/utils";
import { PaginatedPokemonResult } from "@/types/pokemon";
import { useDebounce } from "@/hooks/use-debounce";

const ALL = "__all__";
const SEARCH_DEBOUNCE_MS = 350;

type Props = {
  result: PaginatedPokemonResult;
  types: string[];
  generations: { slug: string; name: string }[];
  currentSearch?: string;
  currentType?: string;
  currentGeneration?: string;
};

export function PokemonExplorer({
  result,
  types,
  generations,
  currentSearch,
  currentType,
  currentGeneration,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentSearch ?? "");
  const debouncedSearch = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);

  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== ALL) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      return qs ? `/?${qs}` : "/";
    },
    [searchParams]
  );

  const navigate = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        router.push(buildUrl(updates));
      });
    },
    [router, buildUrl, startTransition]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentParam = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentParam) {
      navigate({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, navigate, searchParams]);

  const selectSkeleton = (
    className: string
  ) => (
    <div
      className={cn("rounded-md border bg-transparent animate-pulse", className)}
      style={{ height: 36 }}
      aria-hidden
    />
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder="Search Pokémon..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="max-w-md"
        />
        {mounted ? (
          <Select
            value={currentType ?? ALL}
            onValueChange={(v) => navigate({ type: v })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          selectSkeleton("w-full sm:w-40")
        )}
        {mounted ? (
          <Select
            value={currentGeneration ?? ALL}
            onValueChange={(v) => navigate({ generation: v })}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Generation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All generations</SelectItem>
              {generations.map((g) => (
                <SelectItem key={g.slug} value={g.slug}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          selectSkeleton("w-full sm:w-52")
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {result.total} Pokémon found
        {result.totalPages > 1 && (
          <span>
            {" "}
            — Page {result.page} of {result.totalPages}
          </span>
        )}
      </p>

      <div
        className={`space-y-2 transition-opacity ${isPending ? "opacity-50" : ""}`}
      >
        {result.pokemons.map((pokemon) => (
          <PokemonListItem key={pokemon.id} pokemon={pokemon} />
        ))}
        {result.pokemons.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No Pokémon match your filters.
          </p>
        )}
      </div>

      <PokemonPagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}
