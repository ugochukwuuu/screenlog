import { Skeleton } from "./ui/skeleton"

export function SkeletonCard({ className }) {
  return (
    <div className={`w-full mt-4 ${className}`}>
      <Skeleton className="w-full aspect-[2/1] rounded-xl" />
      <div className="space-y-2 mt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}
