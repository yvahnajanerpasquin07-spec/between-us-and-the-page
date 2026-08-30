import { Link } from 'react-router-dom';

export default function JournalCard({ journal, readOnly = false }) {
  return (
    <Link
      to={`/journal/${journal.id}`}
      className="page-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div
        className="h-32 w-full bg-paper-dark bg-cover bg-center"
        style={journal.cover_image_url ? { backgroundImage: `url(${journal.cover_image_url})` } : undefined}
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg text-ink group-hover:text-margin">{journal.title}</h3>
        {journal.description && (
          <p className="line-clamp-2 font-body text-sm text-ink-soft">{journal.description}</p>
        )}
        {readOnly && (
          <span className="mt-auto self-start font-mono text-[10px] uppercase tracking-wide text-moss">
            Shared with you · view only
          </span>
        )}
      </div>
    </Link>
  );
}
