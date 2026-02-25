"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t load the Pokémon list. This might be a temporary issue
        with the API.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
