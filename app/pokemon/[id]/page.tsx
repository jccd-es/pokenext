import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getPokemonDetailed } from "@/lib/api/pokemon";
import {
  TYPE_COLORS,
  STAT_COLORS,
  STAT_LABELS,
  capitalize,
  formatHeight,
  formatWeight,
  genderRatio,
} from "@/lib/pokemon-utils";
import { PokemonCryButton } from "@/components/PokemonCryButton";
import { PokemonImage } from "@/components/PokemonImage";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const name = capitalize(id.replace(/^\d+$/, `pokemon-${id}`));
  return {
    title: `${name} | PokeNext`,
  };
}

const MAX_STAT = 255;

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  let pokemon;
  try {
    pokemon = await getPokemonDetailed(id);
  } catch {
    notFound();
  }

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const backUrl = from ? `/?${decodeURIComponent(from)}` : "/";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-4" />
          Back to list
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold capitalize">{pokemon.name}</h1>
          <span className="text-2xl font-mono text-muted-foreground">
            #{String(pokemon.id).padStart(4, "0")}
          </span>
          {pokemon.species.isLegendary && (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              <Sparkles className="size-3" /> Legendary
            </Badge>
          )}
          {pokemon.species.isMythical && (
            <Badge variant="outline" className="border-purple-500 text-purple-600">
              <Sparkles className="size-3" /> Mythical
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">{pokemon.species.genera}</p>
      </div>

      {/* Main grid: image + info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Image card */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
            <div className="relative w-full max-w-xs aspect-square">
              <PokemonImage
                src={pokemon.sprites.officialArtwork}
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div className="flex gap-2 mt-4">
              {pokemon.types.map((t) => {
                const colors = TYPE_COLORS[t.type.name] ?? {
                  bg: "bg-gray-400",
                  text: "text-white",
                };
                return (
                  <span
                    key={t.type.name}
                    className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium capitalize`}
                  >
                    {t.type.name}
                  </span>
                );
              })}
            </div>
            {pokemon.cries.latest && (
              <PokemonCryButton url={pokemon.cries.latest} name={pokemon.name} />
            )}
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="space-y-6">
          {/* Flavor text */}
          <Card>
            <CardHeader>
              <CardTitle>Pokédex Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed italic">
                &ldquo;{pokemon.species.flavorText}&rdquo;
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Generation</span>
                  <p className="font-medium">{pokemon.species.generation}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Height</span>
                  <p className="font-medium">{formatHeight(pokemon.height)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight</span>
                  <p className="font-medium">{formatWeight(pokemon.weight)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Base XP</span>
                  <p className="font-medium">{pokemon.baseExperience ?? "—"}</p>
                </div>
                {pokemon.species.habitat && (
                  <div>
                    <span className="text-muted-foreground">Habitat</span>
                    <p className="font-medium capitalize">
                      {pokemon.species.habitat}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Growth Rate</span>
                  <p className="font-medium capitalize">
                    {capitalize(pokemon.species.growthRate)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capture Rate</span>
                  <p className="font-medium">{pokemon.species.captureRate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender</span>
                  <p className="font-medium">
                    {genderRatio(pokemon.species.genderRate)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Egg Groups</span>
                  <p className="font-medium capitalize">
                    {pokemon.species.eggGroups.map(capitalize).join(", ") ||
                      "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Base Happiness</span>
                  <p className="font-medium">
                    {pokemon.species.baseHappiness ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abilities */}
          <Card>
            <CardHeader>
              <CardTitle>Abilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((a) => (
                  <Badge
                    key={a.ability.name}
                    variant={a.is_hidden ? "outline" : "secondary"}
                    className="capitalize"
                  >
                    {capitalize(a.ability.name)}
                    {a.is_hidden && (
                      <span className="ml-1 text-xs opacity-60">
                        (Hidden)
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Base Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pokemon.stats.map((stat) => {
            const label = STAT_LABELS[stat.stat.name] ?? stat.stat.name;
            const color = STAT_COLORS[stat.stat.name] ?? "bg-gray-400";
            const pct = (stat.base_stat / MAX_STAT) * 100;
            return (
              <div key={stat.stat.name} className="flex items-center gap-4">
                <span className="text-sm font-medium w-16 text-right shrink-0">
                  {label}
                </span>
                <span className="text-sm font-mono w-10 text-right shrink-0">
                  {stat.base_stat}
                </span>
                <Progress
                  value={pct}
                  className="flex-1 h-3"
                  indicatorClassName={color}
                />
              </div>
            );
          })}
          <Separator />
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold w-16 text-right">Total</span>
            <span className="text-sm font-mono font-bold w-10 text-right">
              {totalStats}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chain */}
      {pokemon.evolutionChain.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evolution Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {pokemon.evolutionChain.map((evo, idx) => {
                const isCurrent = evo.id === pokemon.id;
                return (
                  <div key={evo.id} className="flex items-center gap-2">
                    {idx > 0 && (
                      <div className="flex flex-col items-center text-muted-foreground mx-1">
                        <ChevronRight className="size-5" />
                        {evo.minLevel && (
                          <span className="text-[10px]">Lv. {evo.minLevel}</span>
                        )}
                        {evo.item && (
                          <span className="text-[10px] capitalize">
                            {capitalize(evo.item)}
                          </span>
                        )}
                      </div>
                    )}
                    <Link
                      href={
                        from
                          ? `/pokemon/${evo.id}?from=${encodeURIComponent(from)}`
                          : `/pokemon/${evo.id}`
                      }
                      className={`flex flex-col items-center p-3 rounded-xl transition-all hover:bg-accent ${
                        isCurrent
                          ? "ring-2 ring-primary bg-accent/50 shadow-sm"
                          : ""
                      }`}
                    >
                      <div className="relative size-20 sm:size-24">
                        <PokemonImage
                          src={evo.sprite}
                          alt={evo.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span
                        className={`text-sm capitalize mt-1 ${
                          isCurrent ? "font-bold text-primary" : ""
                        }`}
                      >
                        {evo.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moves */}
      <Card>
        <CardHeader>
          <CardTitle>
            Moves{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({pokemon.moves.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {pokemon.moves.map((m) => (
              <Badge key={m.move.name} variant="outline" className="capitalize">
                {capitalize(m.move.name)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
