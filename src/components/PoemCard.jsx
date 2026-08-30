import { Link } from 'react-router-dom';

export default function PoemCard({ poem, journalId }) {
  const preview = poem.content?.split('\n').slice(0, 3).join(' / ');

  return (
    <Link
      to={`/journal/${journalId}/poem/${poem.id}`}
      className="page-card flex flex-col gap-1 p-4 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-baseline justify-between">
        <h4 className="font-display text-base text-ink">{poem.title || 'Untitled'}</h4>
        {poem.poem_date && (
          <span className="font-mono text-xs text-ink-soft">{poem.poem_date}</span>
        )}
      </div>
      {preview && <p className="truncate font-body text-sm italic text-ink-soft">{preview}</p>}
      {poem.spotify_url && <span className="font-mono text-[10px] text-moss">♫ has music</span>}
    </Link>
  );
}
