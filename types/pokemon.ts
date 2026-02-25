export type PokemonType = {
  slot: number;
  type: {
    name: string;
    localizedName?: string;
  };
};

export type Pokemon = {
  id: number;
  name: string;
  types: PokemonType[];
  generation: string;
  evolutionChainIds: number[];
  height: number;
  weight: number;
  flavorText: string;
  evolvesFromName: string | null;
  isLegendary: boolean;
  isMythical: boolean;
  sprites: {
    front_default: string;
  };
};

export type PokemonListFilters = {
  page: number;
  search?: string;
  type?: string;
  generation?: string;
  language?: string;
};

export type PaginatedPokemonResult = {
  pokemons: Pokemon[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// --- Pokemon Detail (REST API v2) types ---

export type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

export type PokemonAbility = {
  ability: { name: string; localizedName?: string };
  is_hidden: boolean;
  slot: number;
};

export type PokemonMove = {
  move: { name: string; localizedName?: string };
};

export type PokemonCries = {
  latest: string | null;
  legacy: string | null;
};

export type EvolutionNode = {
  id: number;
  name: string;
  localizedName?: string;
  sprite: string;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
};

export type PokemonDetailed = {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  cries: PokemonCries;
  sprites: {
    front_default: string;
    front_shiny: string | null;
    officialArtwork: string;
    officialArtworkShiny: string | null;
  };
  species: {
    genera: string;
    flavorText: string;
    generation: string;
    habitat: string | null;
    growthRate: string;
    captureRate: number;
    baseHappiness: number | null;
    genderRate: number;
    eggGroups: string[];
    isLegendary: boolean;
    isMythical: boolean;
  };
  evolutionChain: EvolutionNode[];
};
