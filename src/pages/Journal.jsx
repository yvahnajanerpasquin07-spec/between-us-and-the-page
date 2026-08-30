import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteJournal, getJournal } from '../services/journalService';
import { createPoem, getPoemsForJournal } from '../services/poemService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import PoemCard from '../components/PoemCard';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ShareModal from '../components/ShareModal';

export default function Journal() {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showShare, setShowShare] = useState(false);

  const { data: journal, loading: journalLoading } = useAsync(
    () => getJournal(journalId),
    [journalId]
  );
  const { data: poems, loading: poemsLoading, refetch } = useAsync(
    () => getPoemsForJournal(journalId),
    [journalId]
  );

  const isOwner = journal && user && journal.owner_id === user.id;

  async function handleNewPoem() {
    const poem = await createPoem({
      journalId,
      title: 'Untitled',
      content: '',
      displayOrder: poems?.length ?? 0,
    });
    navigate(`/journal/${journalId}/poem/${poem.id}`);
  }

  async function handleDeleteJournal() {
    if (!confirm('Delete this journal and all its poems? This cannot be undone.')) return;
    await deleteJournal(journalId);
    navigate('/dashboard');
  }

  if (journalLoading) return <Loading label="Opening journal" />;
  if (!journal) return <p className="p-6">Journal not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl">{journal.title}</h1>
          {journal.description && (
            <p className="mt-2 max-w-lg font-body text-ink-soft">{journal.description}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowShare(true)}>
              Share
            </Button>
            <Button onClick={handleNewPoem}>New poem</Button>
          </div>
        )}
      </div>

      {poemsLoading ? (
        <Loading label="Turning pages" />
      ) : poems?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {poems.map((p) => (
            <PoemCard key={p.id} poem={p} journalId={journalId} />
          ))}
        </div>
      ) : (
        <p className="font-body text-ink-soft">No poems in this journal yet.</p>
      )}

      {isOwner && (
        <button
          onClick={handleDeleteJournal}
          className="mt-12 font-mono text-xs uppercase tracking-wide text-margin/70 hover:text-margin"
        >
          Delete journal
        </button>
      )}

      {showShare && <ShareModal journalId={journalId} onClose={() => setShowShare(false)} />}
    </div>
  );
}
