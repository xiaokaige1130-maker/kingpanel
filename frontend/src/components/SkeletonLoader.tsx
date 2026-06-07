export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-4 w-28 bg-white/6 rounded-full mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map(j => (
              <div key={j}
                className="h-[3.25rem] rounded-2xl bg-white/[0.04] border border-white/[0.04]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
