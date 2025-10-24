// components/LoadingSkeleton.tsx

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-300 rounded w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-300 rounded w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-16 bg-gray-300 rounded w-full"></div>
      </div>
      <div className="h-12 bg-indigo-200 rounded w-full mt-4"></div>
    </div>
  );
}