import { useNavigate, useParams } from 'react-router-dom';
import { getPublicJournal } from '../services/journalService';
import { useAsync } from '../hooks/useAsync';
import Loading from '../components/Loading';
import Button from '../components/Button';

export default function PublicShareLanding() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const {
    data: journal,
    loading,
    error,
  } = useAsync(
    () => getPublicJournal(shareToken),
    [shareToken]
  );

  if (loading) {
    return <Loading label="Opening shared book" />;
  }

  if (error || !journal) {
    return (
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="page-card w-full max-w-lg bg-paper p-8 text-center">
          <h1 className="mb-3 font-display text-2xl">
            This shared book is unavailable
          </h1>
          <p className="mb-6 text-sm text-ink-soft">
            The link may be invalid or the book may no longer be available.
          </p>
          <Button onClick={() => navigate('/')}>
            Go home
          </Button>
        </div>
      </section>
    );
  }

  const authorName = journal.author_name?.trim() || 'Someone';

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="page-card w-full max-w-xl bg-paper p-8 text-center sm:p-12">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          A book was shared with you
        </p>

        <h1 className="mb-8 font-display text-3xl leading-tight sm:text-4xl">
          {authorName} shared a book with you
        </h1>

        <Button
          onClick={() => navigate(`/shared/${shareToken}/book`)}
        >
          Open the book →
        </Button>
      </div>
    </section>
  );
}
