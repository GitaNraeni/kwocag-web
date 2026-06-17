export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 ${className}`}>
      <div className="skeleton h-3 w-20 mb-2" />
      <div className="skeleton h-6 w-16" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonOverview() {
  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="skeleton h-8 w-32 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="skeleton h-4 w-24 mb-4" />
          <div className="skeleton h-28 w-28 rounded-full mx-auto" />
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="skeleton h-4 w-28 mb-4" />
          <div className="skeleton h-28 w-28 rounded-full mx-auto" />
        </div>
      </div>
      {/* Skeleton Grafik Revenue */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-3 w-24" />
        </div>
        {/* Area grafik */}
        <div className="relative h-16">
          {/* Grid line atas */}
          <div className="absolute top-0 left-0 right-0 h-px bg-[var(--card-border)] opacity-40" />
          {/* Grid line tengah */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--card-border)] opacity-20" />
          {/* Batang skeleton dengan tinggi bervariasi */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 px-1">
            {[25, 40, 20, 55, 30, 70, 35, 50, 25, 60, 40, 85].map((h, i) => (
              <div key={i} className="skeleton flex-1 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        {/* Label bulan */}
        <div className="flex gap-1 mt-2 px-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton flex-1 h-1.5 rounded" />
          ))}
        </div>
        {/* Info bar */}
        <div className="mt-2 flex justify-center">
          <div className="skeleton h-3 w-32" />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="skeleton h-4 w-32 mb-4" />
          <SkeletonList count={3} />
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="skeleton h-4 w-32 mb-4" />
          <SkeletonList count={3} />
        </div>
      </div>
    </div>
  );
}
