import {
  Pokemon,
  PokemonDetailed,
  PokemonListFilters,
  PaginatedPokemonResult,
  EvolutionNode,
} from "@/types/pokemon";

const GRAPHQL_URL = "https://graphql.pokeapi.co/v1beta2";
const PAGE_SIZE = 15;

// --- GraphQL Queries ---

const POKEMON_LIST_QUERY = `
  query getPokemonList(
    $limit: Int!,
    $offset: Int!,
    $where: pokemon_bool_exp
  ) {
    pokemon(
      limit: $limit,
      offset: $offset,
      order_by: {id: asc},
      where: $where
    ) {
      id
      name
      height
      weight
      pokemontypes(order_by: {slot: asc}) {
        slot
        type { name }
      }
      pokemonspecy {
        is_legendary
        is_mythical
        evolves_from_species_id
        pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}}, limit: 1) {
          flavor_text
        }
        generation {
          generationnames(where: {language: {name: {_eq: "en"}}}) {
            name
          }
        }
        evolutionchain {
          pokemonspecies(order_by: {id: asc}) {
            id
            name
          }
        }
      }
    }
    pokemon_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

const TYPES_QUERY = `
  query getTypes {
    type(order_by: {name: asc}, where: {pokemontypes_aggregate: {count: {predicate: {_gt: 0}}}}) {
      name
    }
  }
`;

const GENERATIONS_QUERY = `
  query getGenerations {
    generation(order_by: {id: asc}) {
      name
      generationnames(where: {language: {name: {_eq: "en"}}}) {
        name
      }
    }
  }
`;

// --- GraphQL types ---

type GqlPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemontypes: { slot: number; type: { name: string } }[];
  pokemonspecy: {
    is_legendary: boolean;
    is_mythical: boolean;
    evolves_from_species_id: number | null;
    pokemonspeciesflavortexts: { flavor_text: string }[];
    generation: {
      generationnames: { name: string }[];
    };
    evolutionchain: {
      pokemonspecies: { id: number; name: string }[];
    };
  };
};

type GqlPokemonResponse = {
  data: {
    pokemon: GqlPokemon[];
    pokemon_aggregate: { aggregate: { count: number } };
  };
};

type GqlTypesResponse = {
  data: { type: { name: string }[] };
};

type GqlGenerationsResponse = {
  data: {
    generation: {
      name: string;
      generationnames: { name: string }[];
    }[];
  };
};

// --- Helpers ---

function mapToPokemon(gql: GqlPokemon): Pokemon {
  const species = gql.pokemonspecy;
  const chainSpecies = species.evolutionchain.pokemonspecies;
  const chainIds = chainSpecies
    .map((s) => s.id)
    .filter((id) => id !== gql.id);

  const evolvesFromName = species.evolves_from_species_id
    ? (chainSpecies.find((s) => s.id === species.evolves_from_species_id)
        ?.name ?? null)
    : null;

  const rawFlavor = species.pokemonspeciesflavortexts[0]?.flavor_text ?? "";

  return {
    id: gql.id,
    name: gql.name,
    types: gql.pokemontypes,
    generation:
      species.generation.generationnames[0]?.name ?? "Unknown",
    evolutionChainIds: chainIds,
    height: gql.height,
    weight: gql.weight,
    flavorText: rawFlavor.replace(/[\f\n\r]/g, " "),
    evolvesFromName,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    sprites: {
      front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gql.id}.png`,
    },
  };
}

async function gqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  revalidate?: number | false
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: revalidate ?? 86400 },
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  return res.json();
}

function buildWhereClause(filters: PokemonListFilters) {
  const conditions: Record<string, unknown>[] = [];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    // Match by name OR by belonging to an evolution chain
    // where any species matches the search term
    conditions.push({
      _or: [
        { name: { _ilike: pattern } },
        {
          pokemonspecy: {
            evolutionchain: {
              pokemonspecies: { name: { _ilike: pattern } },
            },
          },
        },
      ],
    });
  }

  if (filters.type) {
    conditions.push({
      pokemontypes: { type: { name: { _eq: filters.type } } },
    });
  }

  if (filters.generation) {
    conditions.push({
      pokemonspecy: { generation: { name: { _eq: filters.generation } } },
    });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { _and: conditions };
}

// --- Public API ---

export async function getPokemonList(
  filters: PokemonListFilters
): Promise<PaginatedPokemonResult> {
  const offset = (filters.page - 1) * PAGE_SIZE;
  const where = buildWhereClause(filters);

  const { data } = await gqlFetch<GqlPokemonResponse>(
    POKEMON_LIST_QUERY,
    { limit: PAGE_SIZE, offset, where },
    3600
  );

  const total = data.pokemon_aggregate.aggregate.count;

  return {
    pokemons: data.pokemon.map(mapToPokemon),
    total,
    page: filters.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getTypes(): Promise<string[]> {
  const { data } = await gqlFetch<GqlTypesResponse>(TYPES_QUERY, {}, false);
  return data.type.map((t) => t.name);
}

export async function getGenerations(): Promise<
  { slug: string; name: string }[]
> {
  const { data } = await gqlFetch<GqlGenerationsResponse>(
    GENERATIONS_QUERY,
    {},
    false
  );
  return data.generation.map((g) => ({
    slug: g.name,
    name: g.generationnames[0]?.name ?? g.name,
  }));
}

export async function getPokemon(id: number | string): Promise<Pokemon> {
  const numericId = Number(id);
  const { data } = await gqlFetch<GqlPokemonResponse>(POKEMON_LIST_QUERY, {
    limit: 1,
    offset: 0,
    where: { id: { _eq: numericId } },
  });
  if (!data.pokemon[0]) throw new Error(`Pokemon ${id} not found`);
  return mapToPokemon(data.pokemon[0]);
}

// --- REST API v2 for Pokemon Detail ---

const REST_BASE = "https://pokeapi.co/api/v2";

async function restFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`REST request failed: ${res.status} ${url}`);
  return res.json();
}

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

type EvolutionDetail = {
  min_level?: number | null;
  trigger?: { name: string } | null;
  item?: { name: string } | null;
  held_item?: { name: string } | null;
};

type EvolutionChainNode = {
  species: { name: string; url: string };
  evolution_details?: EvolutionDetail[];
  evolves_to: EvolutionChainNode[];
};

function flattenEvolutionChain(chain: EvolutionChainNode): EvolutionNode[] {
  const nodes: EvolutionNode[] = [];

  function walk(node: EvolutionChainNode) {
    const speciesUrl: string = node.species.url;
    const id = Number(speciesUrl.split("/").filter(Boolean).pop());
    const detail = node.evolution_details?.[0];

    nodes.push({
      id,
      name: node.species.name,
      sprite: spriteUrl(id),
      minLevel: detail?.min_level ?? null,
      trigger: detail?.trigger?.name ?? null,
      item: detail?.item?.name ?? detail?.held_item?.name ?? null,
    });

    for (const child of node.evolves_to) {
      walk(child);
    }
  }

  walk(chain);
  return nodes;
}

type RestPokemonData = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean; slot: number }[];
  moves: { move: { name: string } }[];
  cries?: { latest?: string; legacy?: string };
  sprites: {
    front_default: string;
    front_shiny: string;
    other?: {
      "official-artwork"?: {
        front_default?: string;
        front_shiny?: string;
      };
    };
  };
  species: { url: string };
};

type RestSpeciesData = {
  genera: { genus: string; language: { name: string } }[];
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  generation: { name: string };
  habitat?: { name: string } | null;
  growth_rate: { name: string };
  capture_rate: number;
  base_happiness: number;
  gender_rate: number;
  egg_groups: { name: string }[];
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: { url: string };
};

type RestEvolutionData = {
  chain: EvolutionChainNode;
};

export async function getPokemonDetailed(
  id: number | string
): Promise<PokemonDetailed> {
  const pokemonData = await restFetch<RestPokemonData>(`${REST_BASE}/pokemon/${id}`);
  
  const speciesUrl: string = pokemonData.species.url;
  const speciesId = speciesUrl.split("/").filter(Boolean).pop();
  
  const speciesData = await restFetch<RestSpeciesData>(`${REST_BASE}/pokemon-species/${speciesId}`);

  const evolutionChainUrl: string = speciesData.evolution_chain.url;
  const evoData = await restFetch<RestEvolutionData>(evolutionChainUrl);
  const evolutionChain = flattenEvolutionChain(evoData.chain);

  const englishGenus =
    speciesData.genera.find((g) => g.language.name === "en")?.genus ?? "";

  const flavorEntry = speciesData.flavor_text_entries.find(
    (e) => e.language.name === "en"
  );
  const flavorText = flavorEntry?.flavor_text.replace(/[\f\n\r]/g, " ") ?? "";

  const generationName =
    speciesData.generation.name.replace("generation-", "").toUpperCase();

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    height: pokemonData.height,
    weight: pokemonData.weight,
    baseExperience: pokemonData.base_experience,
    types: pokemonData.types.map((t) => ({
      slot: t.slot,
      type: { name: t.type.name },
    })),
    stats: pokemonData.stats.map((s) => ({
      base_stat: s.base_stat,
      stat: { name: s.stat.name },
    })),
    abilities: pokemonData.abilities.map((a) => ({
      ability: { name: a.ability.name },
      is_hidden: a.is_hidden,
      slot: a.slot,
    })),
    moves: pokemonData.moves.map((m) => ({
      move: { name: m.move.name },
    })),
    cries: {
      latest: pokemonData.cries?.latest ?? null,
      legacy: pokemonData.cries?.legacy ?? null,
    },
    sprites: {
      front_default: pokemonData.sprites.front_default,
      front_shiny: pokemonData.sprites.front_shiny,
      officialArtwork:
        pokemonData.sprites.other?.["official-artwork"]?.front_default ??
        spriteUrl(pokemonData.id),
      officialArtworkShiny:
        pokemonData.sprites.other?.["official-artwork"]?.front_shiny ?? null,
    },
    species: {
      genera: englishGenus,
      flavorText,
      generation: `Generation ${generationName}`,
      habitat: speciesData.habitat?.name ?? null,
      growthRate: speciesData.growth_rate.name,
      captureRate: speciesData.capture_rate,
      baseHappiness: speciesData.base_happiness,
      genderRate: speciesData.gender_rate,
      eggGroups: speciesData.egg_groups.map((g) => g.name),
      isLegendary: speciesData.is_legendary,
      isMythical: speciesData.is_mythical,
    },
    evolutionChain,
  };
}
