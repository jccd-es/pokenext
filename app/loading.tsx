import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-6" />

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 max-w-md w-full" />
        <Skeleton className="h-9 w-full sm:w-40" />
        <Skeleton className="h-9 w-full sm:w-52" />
      </div>

      <Skeleton className="h-4 w-36 mb-4" />

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
