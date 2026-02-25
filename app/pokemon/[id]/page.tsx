import { notFound } from "next/navigation";
import { getPokemonDetailed } from "@/lib/api/pokemon";
import { capitalize } from "@/lib/pokemon-utils";
import { PokemonDetailClient } from "@/components/PokemonDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; language?: string }>;
};

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { from, language } = await searchParams;
  const lang = language ?? "en";

  let pokemon;
  try {
    pokemon = await getPokemonDetailed(id, lang);
  } catch {
    notFound();
  }

  const backUrl = from ? `/?${decodeURIComponent(from)}` : "/";

  return <PokemonDetailClient pokemon={pokemon} backUrl={backUrl} from={from} />;
}
