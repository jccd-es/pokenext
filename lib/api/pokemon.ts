import {
  Pokemon,
  PokemonListFilters,
  PaginatedPokemonResult,
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
      pokemontypes(order_by: {slot: asc}) {
        slot
        type { name }
      }
      pokemonspecy {
        generation {
          generationnames(where: {language: {name: {_eq: "en"}}}) {
            name
          }
        }
        evolutionchain {
          pokemonspecies {
            id
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
  pokemontypes: { slot: number; type: { name: string } }[];
  pokemonspecy: {
    generation: {
      generationnames: { name: string }[];
    };
    evolutionchain: {
      pokemonspecies: { id: number }[];
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
  const chainIds = gql.pokemonspecy.evolutionchain.pokemonspecies
    .map((s) => s.id)
    .filter((id) => id !== gql.id);

  return {
    id: gql.id,
    name: gql.name,
    types: gql.pokemontypes,
    generation:
      gql.pokemonspecy.generation.generationnames[0]?.name ?? "Unknown",
    evolutionChainIds: chainIds,
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
