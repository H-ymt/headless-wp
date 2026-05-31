const SKELETON_WIDTHS = ["85%", "90%", "95%", "85%", "90%", "88%"] as const;

export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-5 w-32 rounded bg-gray-200" />
      <div className="mb-8 aspect-video w-full rounded bg-gray-200" />
      <div className="mb-4 h-9 w-3/4 rounded bg-gray-200" />
      <div className="mb-8 flex gap-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {SKELETON_WIDTHS.map((width) => (
          <div
            className="h-4 rounded bg-gray-200"
            key={width}
            style={{ width }}
          />
        ))}
      </div>
    </div>
  );
}
