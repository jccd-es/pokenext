"use client";

import Image from "next/image";
import { useState } from "react";

type PokemonImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PokemonImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
}: PokemonImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/pokeball.svg"
          alt={alt}
          width={fill ? 96 : width ?? 32}
          height={fill ? 96 : height ?? 32}
          className="opacity-50"
        />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/pokeball.svg"
            alt="Loading"
            width={fill ? 96 : width ?? 32}
            height={fill ? 96 : height ?? 32}
            className="opacity-30 animate-pulse"
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={sizes}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
