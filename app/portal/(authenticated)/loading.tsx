export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading customer portal">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64 rounded-xl border bg-background" />
        <div className="h-64 rounded-xl border bg-background" />
      </div>
    </div>
  );
}
