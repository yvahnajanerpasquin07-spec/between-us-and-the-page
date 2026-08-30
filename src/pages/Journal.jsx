import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteJournal, getJournal } from '../services/journalService';
import { createPoem, getPoemsForJournal } from '../services/poemService';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import NotebookCover from '../components/NotebookCover';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ShareModal from '../components/ShareModal';

export default function Journal() {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showShare, setShowShare] = useState(false);
  const [view, setView] = useState('cover');
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const { data: journal, loading: journalLoading } = useAsync(
    () => getJournal(journalId),
    [journalId]
  );
  const { data: poems, loading: poemsLoading } = useAsync(
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

  function openBook() {
    setView('toc');
  }

  function goToPage(index) {
    setDirection(1);
    setPageIndex(index);
    setView('page');
  }

  function nextPage() {
    if (!poems) return;
    if (pageIndex < poems.length - 1) {
      setDirection(1);
      setPageIndex((i) => i + 1);
    }
  }

  function prevPage() {
    if (pageIndex === 0) {
      setDirection(-1);
      setView('toc');
      return;
    }
    setDirection(-1);
    setPageIndex((i) => i - 1);
  }

  if (journalLoading) return <Loading label="Opening journal" />;
  if (!journal) return <p className="p-6">Journal not found.</p>;

  const date = new Date(journal.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12" style={{ perspective: 1800 }}>
      <AnimatePresence mode="wait">
        {view === 'cover' && (
          <motion.div
            key="cover"
            layoutId={`journal-cover-${journal.id}`}
            exit={{ rotateY: -110, opacity: 0.4 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            className="aspect-[3/4] w-full max-w-md cursor-pointer"
            onClick={openBook}
          >
            <NotebookCover
              title={journal.title}
              description={journal.description}
              date={date}
              coverColor={journal.cover_color}
              coverMaterial={journal.cover_material}
              coverImageUrl={journal.cover_image_url}
            />
          </motion.div>
        )}

        {view === 'toc' && (
          <motion.div
            key="toc"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="page-card w-full max-w-md rounded-md p-8 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <h2 className="font-display text-2xl">{journal.title}</h2>
              {isOwner && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowShare(true)}>
                    Share
                  </Button>
                  <Button onClick={handleNewPoem}>New poem</Button>
                </div>
              )}
            </div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wide text-ink-soft">
              Table of contents
            </p>

            {poemsLoading ? (
              <Loading label="Turning pages" />
            ) : poems?.length ? (
              <ul className="flex flex-col divide-y divide-ink/10">
                {poems.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onClick={() => goToPage(i)}
                      className="flex w-full items-center justify-between py-3 text-left hover:text-margin"
                    >
                      <span className="font-body">{p.title || 'Untitled'}</span>
                      <span className="font-mono text-xs text-ink-soft">{p.poem_date ?? ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body text-ink-soft">No poems in this journal yet.</p>
            )}

            {isOwner && (
              <button
                onClick={handleDeleteJournal}
                className="mt-10 font-mono text-xs uppercase tracking-wide text-margin/70 hover:text-margin"
              >
                Delete journal
              </button>
            )}
          </motion.div>
        )}

        {view === 'page' && poems && poems[pageIndex] && (
          <PoemPage
            key={poems[pageIndex].id}
            poem={poems[pageIndex]}
            journalId={journalId}
            isOwner={isOwner}
            direction={direction}
            onNext={nextPage}
            onPrev={prevPage}
            hasNext={pageIndex < poems.length - 1}
            pageNumber={pageIndex + 1}
            totalPages={poems.length}
          />
        )}
      </AnimatePresence>

      {showShare && <ShareModal journalId={journalId} onClose={() => setShowShare(false)} />}
    </div>
  );
}

function PoemPage({ poem, journalId, isOwner, direction, onNext, onPrev, hasNext, pageNumber, totalPages }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ transformStyle: 'preserve-3d' }}
      className="page-card flex w-full max-w-md flex-col rounded-md p-8 shadow-xl"
    >
      <div className="mb-4">
        <h2 className="font-display text-2xl">{poem.title || 'Untitled'}</h2>
        {poem.poem_date && (
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-soft">
            {poem.poem_date}
          </p>
        )}
      </div>

      <p className="mb-6 flex-1 whitespace-pre-line font-body leading-relaxed">{poem.content}</p>

      {isOwner && (
        <button
          onClick={() => navigate(`/journal/${journalId}/poem/${poem.id}`)}
          className="mb-4 self-start font-mono text-xs uppercase tracking-wide text-margin/80 hover:text-margin"
        >
          Edit this page
        </button>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4">
        <button onClick={onPrev} className="font-mono text-xs uppercase tracking-wide hover:text-margin">
          ← Previous
        </button>
        <span className="font-mono text-[10px] text-ink-soft">
          Page {pageNumber} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="font-mono text-xs uppercase tracking-wide hover:text-margin disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
}