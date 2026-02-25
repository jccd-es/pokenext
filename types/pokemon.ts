export type PokemonType = {
  slot: number;
  type: {
    name: string;
  };
};

export type Pokemon = {
  id: number;
  name: string;
  types: PokemonType[];
  generation: string;
  evolutionChainIds: number[];
  sprites: {
    front_default: string;
  };
};

export type PokemonListFilters = {
  page: number;
  search?: string;
  type?: string;
  generation?: string;
};

export type PaginatedPokemonResult = {
  pokemons: Pokemon[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
