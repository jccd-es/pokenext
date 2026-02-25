"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type Props = {
  page: number;
  totalPages: number;
};

/**
 * Visible page window: always show first, last, and up to 2 neighbors
 * around the current page, with ellipsis for gaps.
 */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(sorted[i]);
  }

  return result;
}

export function PokemonPagination({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildHref = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (targetPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(targetPage));
      }
      const qs = params.toString();
      return qs ? `/?${qs}` : "/";
    },
    [searchParams]
  );

  const navigate = useCallback(
    (targetPage: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(buildHref(targetPage));
    },
    [router, buildHref]
  );

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(page - 1)}
            onClick={navigate(page - 1)}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={buildHref(p)}
                onClick={navigate(p)}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={buildHref(page + 1)}
            onClick={navigate(page + 1)}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
