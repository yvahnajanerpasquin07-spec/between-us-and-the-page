import { useEffect, useState } from 'react';
import {
  shareJournalByEmail,
  getSharesForJournal,
  getOrCreatePublicShareToken,
  getOrCreateEditorShareToken,
  getPublicShareViewCount,
  revokeShare,
  updateShareRole,
} from '../services/shareService';
import { useAsync } from '../hooks/useAsync';
import Button from './Button';
import Input from './Input';

export default function ShareModal({
  journalId,
  onClose,
}) {
  const [email, setEmail] = useState('');
  const [shareRole, setShareRole] = useState('viewer');
  const [status, setStatus] = useState(null);
  const [publicLink, setPublicLink] = useState('');
  const [editorLink, setEditorLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [editorLinkCopied, setEditorLinkCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const {
    data: shares,
    loading,
    refetch,
  } = useAsync(
    () => getSharesForJournal(journalId),
    [journalId]
  );

  useEffect(() => {
    let active = true;

    getPublicShareViewCount(journalId)
      .then((count) => {
        if (active) {
          setViewCount(count);
        }
      })
      .catch(() => {
        // Keep the share modal usable if the view counter is unavailable.
      });

    return () => {
      active = false;
    };
  }, [journalId]);

  async function handleShare(e) {
    e.preventDefault();
    setStatus(null);

    try {
      await shareJournalByEmail(
        journalId,
        email.trim().toLowerCase(),
        shareRole
      );

      setEmail('');
      refetch();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message,
      });
    }
  }

  async function handleGenerateLink() {
    setStatus(null);
    setCopied(false);
    setLinkLoading(true);

    try {
      const token = await getOrCreatePublicShareToken(journalId);

      const link =
        `${window.location.origin}${import.meta.env.BASE_URL}#/shared/${token}`;

      setPublicLink(link);
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err.message ||
          'Could not create a share link.',
      });
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleGenerateEditorLink() {
    setStatus(null);
    setEditorLinkCopied(false);
    setLinkLoading(true);

    try {
      const token = await getOrCreateEditorShareToken(journalId);

      const link =
        `${window.location.origin}${import.meta.env.BASE_URL}#/collab/${token}`;

      setEditorLink(link);

      try {
        await navigator.clipboard.writeText(link);
        setEditorLinkCopied(true);
        window.setTimeout(
          () => setEditorLinkCopied(false),
          2000
        );
      } catch {
        // The link is still displayed so it can be copied manually.
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err.message ||
          'Could not create the editor link.',
      });
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!publicLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      setStatus({
        type: 'error',
        message:
          'Could not copy the link. Please copy it manually.',
      });
    }
  }

  async function handleCopyEditorLink() {
    if (!editorLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(editorLink);
      setEditorLinkCopied(true);
      window.setTimeout(
        () => setEditorLinkCopied(false),
        2000
      );
    } catch {
      setStatus({
        type: 'error',
        message:
          'Could not copy the editor link. Please copy it manually.',
      });
    }
  }

  async function handleRoleChange(shareId, role) {
    try {
      await updateShareRole(shareId, role);
      refetch();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message,
      });
    }
  }

  async function handleRevoke(shareId) {
    try {
      await revokeShare(shareId);
      refetch();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message,
      });
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[3000]
        flex
        items-center
        justify-center
        bg-ink/40
        p-4
      "
    >
      <div
        className="
          page-card
          w-full
          max-w-md
          max-h-[90vh]
          overflow-y-auto
          bg-paper
          p-6
        "
      >
        <h3 className="mb-4 font-display text-lg">
          Share this journal
        </h3>

        {/* =================================================
            VIEW-ONLY LINK
        ================================================= */}
        <div
          className="
            mb-4
            rounded-lg
            border
            border-ink/10
            bg-ink/5
            p-4
          "
        >
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-ink-soft">
            View-only link
          </p>

          <p className="mb-3 text-sm text-ink-soft">
            Anyone with this link can view the journal, but cannot edit it.
          </p>

          <div className="mb-3 flex items-center gap-1 font-mono text-xs text-ink-soft">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            <span>
              {viewCount} {viewCount === 1 ? 'view' : 'views'}
            </span>
          </div>

          {!publicLink ? (
            <Button
              type="button"
              onClick={handleGenerateLink}
              disabled={linkLoading}
              className="w-full"
            >
              {linkLoading
                ? 'Creating link…'
                : 'Generate view-only link'}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={publicLink}
                readOnly
                className="input-field w-full text-xs"
                onFocus={(e) => e.target.select()}
              />

              <Button
                type="button"
                onClick={handleCopyLink}
                className="w-full"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </div>
          )}
        </div>

        {/* =================================================
            EDITOR LINK
        ================================================= */}
        <div
          className="
            mb-6
            rounded-lg
            border
            border-ink/10
            bg-ink/5
            p-4
          "
        >
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-ink-soft">
            Editor link
          </p>

          <p className="mb-3 text-sm text-ink-soft">
            Give this link to someone who has been added as an editor below. They can edit the poems and journal content, but not manage sharing or delete the journal.
          </p>

          {!editorLink ? (
            <Button
              type="button"
              onClick={handleGenerateEditorLink}
              disabled={linkLoading}
              className="w-full"
            >
              {linkLoading ? 'Creating editor link…' : 'Generate editor link'}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editorLink}
                readOnly
                className="input-field w-full text-xs"
                onFocus={(e) => e.target.select()}
              />

              <Button
                type="button"
                onClick={handleCopyEditorLink}
                className="w-full"
              >
                {editorLinkCopied ? 'Copied!' : 'Copy editor link'}
              </Button>
            </div>
          )}
        </div>

        {/* =================================================
            REGISTERED USER SHARING
        ================================================= */}
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Share with a registered user
        </p>

        <form
          onSubmit={handleShare}
          className="mb-4 flex flex-col gap-2 sm:flex-row"
        >
          <Input
            id="share-email"
            type="email"
            placeholder="reader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <select
            value={shareRole}
            onChange={(e) => setShareRole(e.target.value)}
            className="input-field sm:w-28"
            aria-label="Share permission"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>

          <Button type="submit">
            Add
          </Button>
        </form>

        {status?.type === 'error' && (
          <p className="mb-3 text-sm text-margin">
            {status.message}
          </p>
        )}

        <h4 className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Current collaborators
        </h4>

        {loading ? (
          <p className="text-sm text-ink-soft">
            Loading…
          </p>
        ) : shares?.length ? (
          <ul className="flex flex-col gap-3">
            {shares.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate">
                  {s.profiles?.email ?? s.viewer_id}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={s.role || 'viewer'}
                    onChange={(e) =>
                      handleRoleChange(
                        s.id,
                        e.target.value
                      )
                    }
                    className="rounded border border-ink/15 bg-transparent px-2 py-1 font-mono text-[10px] uppercase"
                    aria-label={`Permission for ${s.profiles?.email ?? s.viewer_id}`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRevoke(s.id)}
                    className="text-margin hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">
            Not shared with anyone yet.
          </p>
        )}

        <Button
          variant="secondary"
          className="mt-6 w-full"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </div>
  );
}