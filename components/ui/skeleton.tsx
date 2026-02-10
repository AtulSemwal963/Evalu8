import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

// Assessment skeleton for dashboard
export function AssessmentSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-10 w-10 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-8 w-12 rounded-xl" />
      </div>
    </div>
  )
}

// Assessment skeleton for assessments page
export function AssessmentCardSkeleton() {
  return (
    <div className="relative transition-colors hover:bg-slate-50/30">
      <div className="p-4 md:grid md:grid-cols-12 items-center flex flex-col md:flex-row gap-3 md:gap-0">
        <div className="col-span-6 flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="col-span-2 text-center">
          <Skeleton className="h-6 w-16 rounded-lg mx-auto" />
        </div>
        <div className="col-span-2 text-center">
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
        <div className="col-span-2 flex items-center justify-end w-full md:w-auto pr-2 gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Multiple assessment skeletons
export function AssessmentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, index) => (
        <AssessmentCardSkeleton key={index} />
      ))}
    </div>
  )
}

export { Skeleton }
