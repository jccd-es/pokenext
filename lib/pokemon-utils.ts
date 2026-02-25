export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: "bg-stone-400", text: "text-white" },
  fire: { bg: "bg-orange-500", text: "text-white" },
  water: { bg: "bg-blue-500", text: "text-white" },
  electric: { bg: "bg-yellow-400", text: "text-black" },
  grass: { bg: "bg-green-500", text: "text-white" },
  ice: { bg: "bg-cyan-300", text: "text-black" },
  fighting: { bg: "bg-red-700", text: "text-white" },
  poison: { bg: "bg-purple-500", text: "text-white" },
  ground: { bg: "bg-amber-600", text: "text-white" },
  flying: { bg: "bg-indigo-300", text: "text-black" },
  psychic: { bg: "bg-pink-500", text: "text-white" },
  bug: { bg: "bg-lime-500", text: "text-white" },
  rock: { bg: "bg-yellow-700", text: "text-white" },
  ghost: { bg: "bg-purple-700", text: "text-white" },
  dragon: { bg: "bg-violet-700", text: "text-white" },
  dark: { bg: "bg-stone-700", text: "text-white" },
  steel: { bg: "bg-slate-400", text: "text-black" },
  fairy: { bg: "bg-pink-300", text: "text-black" },
};

export const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-yellow-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-green-500",
  speed: "bg-pink-500",
};

export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function capitalize(str: string) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatHeight(dm: number): string {
  const m = dm / 10;
  return `${m.toFixed(1)} m`;
}

export function formatWeight(hg: number): string {
  const kg = hg / 10;
  return `${kg.toFixed(1)} kg`;
}

export function genderRatio(rate: number): string {
  if (rate === -1) return "Genderless";
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return `${male.toFixed(0)}% ♂ / ${female.toFixed(0)}% ♀`;
}
