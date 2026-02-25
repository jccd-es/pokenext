"use client";

import { useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";

export function PokemonCryButton({
  url,
  name,
  language,
}: {
  url: string;
  name: string;
  language?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = useTranslations(language);

  function play() {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mt-3 gap-2"
      onClick={play}
      aria-label={`${t.pokemon.playCry} ${name}`}
    >
      <Volume2 className="size-4" />
      {t.pokemon.playCry}
    </Button>
  );
}
