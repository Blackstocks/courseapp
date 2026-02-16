export default function CalendarLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded-lg" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
      {/* Calendar grid skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={`h-${i}`} className="h-6 bg-gray-100 rounded" />
          ))}
          {/* Calendar cells */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
