export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading dashboard">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-56 rounded-xl border bg-background" />
        ))}
      </div>
    </div>
  );
}
