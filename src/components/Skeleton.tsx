'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'image' | 'text' | 'circle';
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClass = 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:400%_100%] rounded-xl';

  const variants = {
    card: `${baseClass} w-full h-64`,
    image: `${baseClass} w-full aspect-square`,
    text: `${baseClass} h-4 w-3/4`,
    circle: `${baseClass} w-10 h-10 rounded-full`,
  };

  return <div className={`${variants[variant]} ${className}`} />;
}

export function AlbumCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/[0.08]">
      <Skeleton variant="card" className="aspect-[4/3]" />
      <div className="px-5 py-4 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="image" />
      ))}
    </div>
  );
}
