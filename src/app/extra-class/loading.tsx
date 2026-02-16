export default function ExtraClassLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded-lg mb-6" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-20 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="h-6 w-40 bg-gray-200 rounded-lg mb-4" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
