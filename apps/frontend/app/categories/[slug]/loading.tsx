export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-5 w-32 rounded bg-gray-200" />
      <div className="mb-12 h-9 w-48 rounded bg-gray-200" />
      <div className="space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
          <div key={i}>
            <div className="mb-4 aspect-video w-full rounded bg-gray-200" />
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
