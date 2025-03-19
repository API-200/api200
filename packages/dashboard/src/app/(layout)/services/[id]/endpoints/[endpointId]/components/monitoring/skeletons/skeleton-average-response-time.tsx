import { Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonAverageResponseTime() {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-8 w-16" />
            <span className="text-muted-foreground">ms</span>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-4 h-40">
          <div className="grid grid-cols-12 gap-2 h-full items-end">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full"
                style={{
                  height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

