import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deletePoem, getPoem, updatePoem } from '../services/poemService';
import { getJournal } from '../services/journalService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { isValidSpotifyUrl } from '../utils/spotify';
import SpotifyPlayer from '../components/SpotifyPlayer';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';

export default function Poem() {
  const { journalId, poemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: journal } = useAsync(() => getJournal(journalId), [journalId]);
  const { data: poem, loading } = useAsync(() => getPoem(poemId), [poemId]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [poemDate, setPoemDate] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'spotify' | 'link' | 'image' | null

  useEffect(() => {
    if (poem) {
      setTitle(poem.title ?? '');
      setContent(poem.content ?? '');
      setPoemDate(poem.poem_date ?? '');
      setSpotifyUrl(poem.spotify_url ?? '');
    }
  }, [poem]);

  const isOwner = journal && user && journal.owner_id === user.id;

  async function handleSave() {
    if (spotifyUrl && !isValidSpotifyUrl(spotifyUrl)) {
      setSpotifyError('That doesn\u2019t look like a Spotify track, album, or playlist link.');
      return;
    }
    setSpotifyError(null);
    setSaving(true);
    try {
      await updatePoem(poemId, {
        title,
        content,
        poem_date: poemDate || null,
        spotify_url: spotifyUrl || null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this poem? This cannot be undone.')) return;
    await deletePoem(poemId);
    navigate(`/journal/${journalId}`);
  }

  if (loading) return <Loading label="Turning to this page" />;
  if (!poem) return <p className="p-6">Poem not found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {isOwner ? (
        <div className="flex gap-8">
          {/* Main editor */}
          <div className="flex flex-1 flex-col gap-4">
            <Input id="poem-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              id="poem-date"
              label="Date"
              type="date"
              value={poemDate}
              onChange={(e) => setPoemDate(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="poem-content" className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Poem
              </label>
              <textarea
                id="poem-content"
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field font-body leading-relaxed"
              />
            </div>

            {activePanel === 'spotify' && (
              <div className="flex flex-col gap-2 rounded-md border border-ink/10 p-4">
                <Input
                  id="spotify-url"
                  label="Spotify link"
                  placeholder="https://open.spotify.com/track/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                />
                {spotifyError && <p className="text-sm text-margin">{spotifyError}</p>}
                {spotifyUrl && isValidSpotifyUrl(spotifyUrl) && <SpotifyPlayer spotifyUrl={spotifyUrl} />}
              </div>
            )}

            {!activePanel && spotifyUrl && isValidSpotifyUrl(spotifyUrl) && (
              <SpotifyPlayer spotifyUrl={spotifyUrl} />
            )}

            <div className="mt-2 flex items-center justify-between">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <button
                onClick={handleDelete}
                className="font-mono text-xs uppercase tracking-wide text-margin/70 hover:text-margin"
              >
                Delete poem
              </button>
            </div>
          </div>

          {/* Add-ons sidebar */}
          <aside className="w-48 shrink-0">
            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
              Add to this page
            </p>
            <div className="flex flex-col gap-2">
              <SidebarButton
                label="Spotify song"
                active={activePanel === 'spotify'}
                onClick={() => setActivePanel(activePanel === 'spotify' ? null : 'spotify')}
              />
              <SidebarButton label="Link" disabled title="Coming soon" />
              <SidebarButton label="Picture" disabled title="Coming soon" />
            </div>
          </aside>
        </div>
      ) : (
        <article className="mx-auto flex max-w-2xl flex-col gap-4">
          <h1 className="font-display text-3xl">{poem.title}</h1>
          {poem.poem_date && <p className="font-mono text-sm text-ink-soft">{poem.poem_date}</p>}
          <p className="whitespace-pre-line font-body text-lg leading-relaxed">{poem.content}</p>
          {poem.spotify_url && <SpotifyPlayer spotifyUrl={poem.spotify_url} />}
        </article>
      )}
    </div>
  );
}

function SidebarButton({ label, active, disabled, title, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md border px-3 py-2 text-left font-body text-sm transition-colors ${
        active
          ? 'border-margin bg-margin/10 text-margin'
          : disabled
          ? 'cursor-not-allowed border-ink/10 text-ink-soft/50'
          : 'border-ink/10 hover:border-margin/50 hover:text-margin'
      }`}
    >
      {label}
    </button>
  );
}