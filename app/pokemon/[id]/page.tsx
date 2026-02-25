import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function PokemonPage() {

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-center items-center">
              <div className="text-center space-y-2">
                <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <Skeleton className="h-6 w-6" />
              <div className="text-center space-y-2">
                <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <Skeleton className="h-6 w-6" />
              <div className="text-center space-y-2">
                <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}