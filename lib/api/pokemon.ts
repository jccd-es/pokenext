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
    $where: pokemon_bool_exp,
    $language: String!
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
        type {
          name
          typenames(where: {language: {name: {_eq: $language}}}) { name }
        }
      }
      pokemonspecy {
        is_legendary
        is_mythical
        evolves_from_species_id
        pokemonspeciesflavortexts(where: {language: {name: {_eq: $language}}}, limit: 1) {
          flavor_text
        }
        generation {
          generationnames(where: {language: {name: {_eq: $language}}}) {
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
  query getTypes($language: String!) {
    type(order_by: {name: asc}, where: {pokemontypes_aggregate: {count: {predicate: {_gt: 0}}}}) {
      name
      typenames(where: {language: {name: {_eq: $language}}}) { name }
    }
  }
`;

const GENERATIONS_QUERY = `
  query getGenerations($language: String!) {
    generation(order_by: {id: asc}) {
      name
      generationnames(where: {language: {name: {_eq: $language}}}) {
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
  pokemontypes: {
    slot: number;
    type: { name: string; typenames: { name: string }[] };
  }[];
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
  data: { type: { name: string; typenames: { name: string }[] }[] };
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
    types: gql.pokemontypes.map((t) => ({
      slot: t.slot,
      type: {
        name: t.type.name,
        localizedName: t.type.typenames[0]?.name,
      },
    })),
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
  const language = filters.language ?? "en";

  const { data } = await gqlFetch<GqlPokemonResponse>(
    POKEMON_LIST_QUERY,
    { limit: PAGE_SIZE, offset, where, language },
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

export type PokemonTypeOption = {
  slug: string;
  name: string;
};

export async function getTypes(
  language = "en"
): Promise<PokemonTypeOption[]> {
  const { data } = await gqlFetch<GqlTypesResponse>(
    TYPES_QUERY,
    { language },
    false
  );
  return data.type.map((t) => ({
    slug: t.name,
    name: t.typenames[0]?.name ?? t.name,
  }));
}

export async function getGenerations(
  language = "en"
): Promise<{ slug: string; name: string }[]> {
  const { data } = await gqlFetch<GqlGenerationsResponse>(
    GENERATIONS_QUERY,
    { language },
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

// --- GraphQL Query for Pokemon Detail (optimized single request) ---

const POKEMON_DETAIL_QUERY = `
  query getPokemonDetail($id: Int!, $lang: String!) {
    pokemon(where: {id: {_eq: $id}}) {
      id
      name
      height
      weight
      base_experience
      pokemoncries { cries }
      pokemonsprites { sprites }
      pokemontypes(order_by: {slot: asc}) {
        slot
        type {
          name
          typenames(where: {language: {name: {_eq: $lang}}}) { name }
        }
      }
      pokemonabilities(order_by: {slot: asc}) {
        slot
        is_hidden
        ability {
          name
          abilitynames(where: {language: {name: {_eq: $lang}}}) { name }
        }
      }
      pokemonstats {
        base_stat
        stat { name }
      }
      pokemonmoves(distinct_on: move_id) {
        move {
          name
          movenames(where: {language: {name: {_eq: $lang}}}) { name }
        }
      }
      pokemonspecy {
        base_happiness
        capture_rate
        gender_rate
        is_legendary
        is_mythical
        pokemonspeciesnames(where: {language: {name: {_eq: $lang}}}) {
          name
          genus
        }
        pokemonspeciesflavortexts(where: {language: {name: {_eq: $lang}}}, limit: 1) {
          flavor_text
        }
        generation { name }
        growthrate { name }
        pokemonhabitat { name }
        pokemonegggroups {
          egggroup { name }
        }
        evolutionchain {
          pokemonspecies(order_by: {id: asc}) {
            id
            name
            pokemonspeciesnames(where: {language: {name: {_eq: $lang}}}) { name }
            pokemonevolutions {
              min_level
              evolutiontrigger { name }
              item { name }
              ItemByHeldItemId { name }
            }
          }
        }
      }
    }
  }
`;

type GqlDetailPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  pokemoncries: { cries: { latest?: string; legacy?: string } }[];
  pokemonsprites: { sprites: Record<string, unknown> }[];
  pokemontypes: {
    slot: number;
    type: { name: string; typenames: { name: string }[] };
  }[];
  pokemonabilities: {
    slot: number;
    is_hidden: boolean;
    ability: { name: string; abilitynames: { name: string }[] };
  }[];
  pokemonstats: { base_stat: number; stat: { name: string } }[];
  pokemonmoves: {
    move: { name: string; movenames: { name: string }[] };
  }[];
  pokemonspecy: {
    base_happiness: number | null;
    capture_rate: number;
    gender_rate: number;
    is_legendary: boolean;
    is_mythical: boolean;
    pokemonspeciesnames: { name: string; genus: string }[];
    pokemonspeciesflavortexts: { flavor_text: string }[];
    generation: { name: string };
    growthrate: { name: string };
    pokemonhabitat: { name: string } | null;
    pokemonegggroups: { egggroup: { name: string } }[];
    evolutionchain: {
      pokemonspecies: {
        id: number;
        name: string;
        pokemonspeciesnames: { name: string }[];
        pokemonevolutions: {
          min_level: number | null;
          evolutiontrigger: { name: string } | null;
          item: { name: string } | null;
          ItemByHeldItemId: { name: string } | null;
        }[];
      }[];
    };
  };
};

type GqlDetailResponse = {
  data: { pokemon: GqlDetailPokemon[] };
};

function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function getPokemonDetailed(
  id: number | string,
  language = "en"
): Promise<PokemonDetailed> {
  const numericId = Number(id);
  const { data } = await gqlFetch<GqlDetailResponse>(
    POKEMON_DETAIL_QUERY,
    { id: numericId, lang: language },
    3600
  );

  const poke = data.pokemon[0];
  if (!poke) throw new Error(`Pokemon ${id} not found`);

  const species = poke.pokemonspecy;
  const speciesName = species.pokemonspeciesnames[0];
  const sprites = poke.pokemonsprites[0]?.sprites as {
    front_default?: string;
    front_shiny?: string;
    other?: { "official-artwork"?: { front_default?: string; front_shiny?: string } };
  } | undefined;
  const cries = poke.pokemoncries[0]?.cries;

  const generationName = species.generation.name.replace("generation-", "").toUpperCase();
  const flavorText = species.pokemonspeciesflavortexts[0]?.flavor_text?.replace(/[\f\n\r]/g, " ") ?? "";

  const evolutionChain: EvolutionNode[] = species.evolutionchain.pokemonspecies.map((sp) => {
    const evo = sp.pokemonevolutions[0];
    return {
      id: sp.id,
      name: sp.name,
      localizedName: sp.pokemonspeciesnames[0]?.name,
      sprite: spriteUrl(sp.id),
      minLevel: evo?.min_level ?? null,
      trigger: evo?.evolutiontrigger?.name ?? null,
      item: evo?.item?.name ?? evo?.ItemByHeldItemId?.name ?? null,
    };
  });

  return {
    id: poke.id,
    name: poke.name,
    height: poke.height,
    weight: poke.weight,
    baseExperience: poke.base_experience,
    types: poke.pokemontypes.map((t) => ({
      slot: t.slot,
      type: {
        name: t.type.name,
        localizedName: t.type.typenames[0]?.name,
      },
    })),
    stats: poke.pokemonstats.map((s) => ({
      base_stat: s.base_stat,
      stat: { name: s.stat.name },
    })),
    abilities: poke.pokemonabilities.map((a) => ({
      ability: {
        name: a.ability.name,
        localizedName: a.ability.abilitynames[0]?.name,
      },
      is_hidden: a.is_hidden,
      slot: a.slot,
    })),
    moves: poke.pokemonmoves.map((m) => ({
      move: {
        name: m.move.name,
        localizedName: m.move.movenames[0]?.name,
      },
    })),
    cries: {
      latest: cries?.latest ?? null,
      legacy: cries?.legacy ?? null,
    },
    sprites: {
      front_default: sprites?.front_default ?? spriteUrl(poke.id),
      front_shiny: sprites?.front_shiny ?? null,
      officialArtwork: sprites?.other?.["official-artwork"]?.front_default ?? spriteUrl(poke.id),
      officialArtworkShiny: sprites?.other?.["official-artwork"]?.front_shiny ?? null,
    },
    species: {
      genera: speciesName?.genus ?? "",
      flavorText,
      generation: `Generation ${generationName}`,
      habitat: species.pokemonhabitat?.name ?? null,
      growthRate: species.growthrate.name,
      captureRate: species.capture_rate,
      baseHappiness: species.base_happiness,
      genderRate: species.gender_rate,
      eggGroups: species.pokemonegggroups.map((g) => g.egggroup.name),
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    },
    evolutionChain,
  };
}
