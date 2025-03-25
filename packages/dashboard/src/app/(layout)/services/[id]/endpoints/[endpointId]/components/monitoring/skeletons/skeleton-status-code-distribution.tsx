import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonStatusCodeDistribution() {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Status Code Distribution</CardTitle>
        <CardDescription>2xx/3xx/4xx/5xx breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40">
          <Skeleton className="h-[120px] w-[120px] rounded-full" />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="mt-1 h-4 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

