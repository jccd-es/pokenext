import Image from "next/image";
import { PokemonExplorer } from "@/components/PokemonExplorer";
import {
  getPokemonList,
  getTypes,
  getGenerations,
} from "@/lib/api/pokemon";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    generation?: string;
  }>;
};

export default async function PokemonListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [result, types, generations] = await Promise.all([
    getPokemonList({
      page,
      search: params.search,
      type: params.type,
      generation: params.generation,
    }),
    getTypes(),
    getGenerations(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Image
          src="/pokeball.svg"
          alt="Pokeball"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        PokeNext
      </h1>
      <PokemonExplorer
        result={result}
        types={types}
        generations={generations}
        currentSearch={params.search}
        currentType={params.type}
        currentGeneration={params.generation}
      />
    </div>
  );
}
