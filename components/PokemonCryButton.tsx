"use client";

import { useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PokemonCryButton({
  url,
  name,
}: {
  url: string;
  name: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      aria-label={`Play ${name} cry`}
    >
      <Volume2 className="size-4" />
      Play Cry
    </Button>
  );
}
