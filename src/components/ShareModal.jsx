import { useState } from 'react';
import { findUserByEmail, getSharesForJournal, revokeShare, shareJournal } from '../services/shareService';
import { useAsync } from '../hooks/useAsync';
import Button from './Button';
import Input from './Input';

export default function ShareModal({ journalId, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const { data: shares, loading, refetch } = useAsync(
    () => getSharesForJournal(journalId),
    [journalId]
  );

  async function handleShare(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const person = await findUserByEmail(email.trim());
      if (!person) {
        setStatus({ type: 'error', message: 'No registered user with that email.' });
        return;
      }
      await shareJournal(journalId, person.id);
      setEmail('');
      refetch();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }

  async function handleRevoke(shareId) {
    await revokeShare(shareId);
    refetch();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="page-card w-full max-w-md bg-paper p-6">
        <h3 className="mb-4 font-display text-lg">Share this journal</h3>

        <form onSubmit={handleShare} className="mb-4 flex gap-2">
          <Input
            id="share-email"
            type="email"
            placeholder="reader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Add</Button>
        </form>

        {status?.type === 'error' && <p className="mb-3 text-sm text-margin">{status.message}</p>}

        <h4 className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Current readers
        </h4>
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : shares?.length ? (
          <ul className="flex flex-col gap-2">
            {shares.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.profiles?.email ?? s.viewer_id}</span>
                <button onClick={() => handleRevoke(s.id)} className="text-margin hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">Not shared with anyone yet.</p>
        )}

        <Button variant="secondary" className="mt-6 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
