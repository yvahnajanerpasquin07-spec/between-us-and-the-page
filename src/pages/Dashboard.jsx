import { useState } from 'react';
import { createJournal, getMyJournals, getSharedJournals } from '../services/journalService';
import { useAsync } from '../hooks/useAsync';
import { materialOptions } from '../components/NotebookCover';
import JournalCard from '../components/JournalCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';

export default function Dashboard() {
  const { data: journals, loading, refetch } = useAsync(getMyJournals);
  const { data: sharedJournals, loading: sharedLoading } = useAsync(getSharedJournals);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverMaterial, setCoverMaterial] = useState('kraft');
  const [coverColor, setCoverColor] = useState('#c9a876');

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createJournal({ title, description, coverImageUrl, coverMaterial, coverColor });
      setTitle('');
      setDescription('');
      setCoverImageUrl('');
      setCoverMaterial('kraft');
      setCoverColor('#c9a876');
      setShowForm(false);
      refetch();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">My Library</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New journal'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="page-card mb-10 flex flex-col gap-4 p-6">
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id="description"
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            id="cover-image"
            label="Cover image URL (optional)"
            placeholder="https://..."
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Cover material
            </label>
            <div className="flex gap-2">
              {materialOptions().map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setCoverMaterial(m.value)}
                  className={`rounded-md border px-3 py-1.5 font-body text-sm ${
                    coverMaterial === m.value
                      ? 'border-margin bg-margin/10 text-margin'
                      : 'border-ink/15 hover:border-margin/50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="cover-color"
              className="font-mono text-xs uppercase tracking-wide text-ink-soft"
            >
              Cover color
            </label>
            <input
              id="cover-color"
              type="color"
              value={coverColor}
              onChange={(e) => setCoverColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-md border border-ink/15 bg-transparent"
            />
          </div>

          <Button type="submit" disabled={creating} className="self-start">
            {creating ? 'Creating…' : 'Create journal'}
          </Button>
        </form>
      )}

      <section className="mb-12">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Your journals
        </h2>
        {loading ? (
          <Loading label="Opening your library" />
        ) : journals?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {journals.map((j) => (
              <JournalCard key={j.id} journal={j} />
            ))}
          </div>
        ) : (
          <p className="font-body text-ink-soft">
            No journals yet — start your first one above.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Shared with you
        </h2>
        {sharedLoading ? (
          <Loading label="Checking shared journals" />
        ) : sharedJournals?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {sharedJournals.map((j) => (
              <JournalCard key={j.id} journal={j} readOnly />
            ))}
          </div>
        ) : (
          <p className="font-body text-ink-soft">Nothing shared with you yet.</p>
        )}
      </section>
    </div>
  );
}