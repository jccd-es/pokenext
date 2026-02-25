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
import { PaginatedPokemonResult, Pokemon } from "@/types/pokemon";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LANGUAGES } from "@/lib/i18n/translations";
import { Bot } from "lucide-react";

const ALL = "__all__";
const SEARCH_DEBOUNCE_MS = 350;

type Props = {
  result: PaginatedPokemonResult;
  types: { slug: string; name: string }[];
  generations: { slug: string; name: string }[];
  currentSearch?: string;
  currentType?: string;
  currentGeneration?: string;
  currentLanguage?: string;
};

export function PokemonExplorer({
  result,
  types,
  generations,
  currentSearch,
  currentType,
  currentGeneration,
  currentLanguage,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations(currentLanguage);

  const [searchValue, setSearchValue] = useState(currentSearch ?? "");
  const debouncedSearch = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);

  const [aiResults, setAiResults] = useState<Pokemon[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState<string | null>(null);

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
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentParam = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentParam) {
      navigate({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, navigate, searchParams]);

  useEffect(() => {
    const shouldSearchAi =
      result.pokemons.length === 0 &&
      currentSearch &&
      currentSearch.length >= 2 &&
      !currentType &&
      !currentGeneration;

    if (!shouldSearchAi) {
      setAiResults([]);
      setAiSearchQuery(null);
      return;
    }

    if (aiSearchQuery === currentSearch) return;

    const controller = new AbortController();

    async function fetchAiResults() {
      setIsAiSearching(true);
      setAiResults([]);

      try {
        const response = await fetch("/api/search/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: currentSearch,
            language: currentLanguage ?? "en",
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          setAiResults([]);
          return;
        }

        const { ids } = (await response.json()) as { ids: number[] };
        if (ids.length === 0) {
          setAiResults([]);
          return;
        }

        const { getPokemonsByIds } = await import("@/lib/api/pokemon");
        const pokemons = await getPokemonsByIds(ids, currentLanguage ?? "en");
        const sorted = pokemons
          .map((p) => ({ ...p, isAiResult: true }))
          .sort((a, b) => a.id - b.id);

        setAiResults(sorted);
        setAiSearchQuery(currentSearch ?? null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("AI search failed:", error);
        }
        setAiResults([]);
      } finally {
        setIsAiSearching(false);
      }
    }

    fetchAiResults();

    return () => controller.abort();
  }, [result.pokemons.length, currentSearch, currentType, currentGeneration, currentLanguage, aiSearchQuery]);

  const selectSkeleton = (className: string) => (
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
          placeholder={t.search.placeholder}
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
              <SelectValue placeholder={t.filters.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.filters.allTypes}</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.slug} value={type.slug} className="capitalize">
                  {type.name}
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
              <SelectValue placeholder={t.filters.generation} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.filters.allGenerations}</SelectItem>
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
        {mounted ? (
          <Select
            value={currentLanguage ?? "en"}
            onValueChange={(v) => navigate({ language: v })}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder={t.filters.language} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LANGUAGES).map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          selectSkeleton("w-full sm:w-32")
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {result.total} {t.search.results}
        {result.totalPages > 1 && (
          <span>
            {" "}
            — {t.search.page} {result.page} {t.search.of} {result.totalPages}
          </span>
        )}
      </p>

      <div
        className={`space-y-2 transition-opacity ${isPending ? "opacity-50" : ""}`}
      >
        {result.pokemons.map((pokemon) => (
          <PokemonListItem
            key={pokemon.id}
            pokemon={pokemon}
            searchParams={searchParams}
          />
        ))}
        {result.pokemons.length === 0 && aiResults.length === 0 && !isAiSearching && (
          <p className="text-center text-muted-foreground py-12">
            {t.search.noResults}
          </p>
        )}
        {result.pokemons.length === 0 && isAiSearching && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Bot className="h-4 w-4 animate-pulse" />
            <span>Searching with AI...</span>
          </div>
        )}
        {aiResults.length > 0 && (
          <>
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground border-t mt-4">
              <Bot className="h-4 w-4 text-violet-500" />
              <span>{aiResults.length} {t.search.aiResults}</span>
            </div>
            {aiResults.map((pokemon) => (
              <PokemonListItem
                key={`ai-${pokemon.id}`}
                pokemon={pokemon}
                searchParams={searchParams}
              />
            ))}
          </>
        )}
      </div>

      <PokemonPagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}
