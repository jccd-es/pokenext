import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PokemonNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center">
      <p className="text-6xl mb-4">?</p>
      <h1 className="text-2xl font-bold mb-2">Pokémon Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The Pokémon you&apos;re looking for doesn&apos;t exist or has escaped
        into the wild.
      </p>
      <Button asChild>
        <Link href="/">
          <ArrowLeft className="size-4 mr-2" />
          Back to Pokédex
        </Link>
      </Button>
    </div>
  );
}
