export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded-lg animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="rounded-3xl border-border/60 border p-6">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 flex-1 min-w-[250px] bg-muted rounded-full animate-pulse" />
          <div className="h-10 w-[180px] bg-muted rounded-full animate-pulse" />
          <div className="h-10 w-[180px] bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border-border/60 border p-6">
            <div className="flex gap-6">
              <div className="h-28 w-28 bg-muted rounded-2xl animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
