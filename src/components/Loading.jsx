export default function Loading({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-2 py-10 justify-center font-hand text-2xl text-ink-soft">
      <span className="animate-pulse">{label}…</span>
    </div>
  );
}
