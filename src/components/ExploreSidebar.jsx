import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ExploreSidebar({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close explore menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-ink/35 backdrop-blur-[2px]"
      />

      <aside
        className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l border-ink/15 bg-paper px-6 py-7 shadow-2xl sm:px-8"
        aria-label="Explore"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Discover
            </p>
            <h2 className="mt-2 font-display text-3xl italic text-ink">
              Explore
            </h2>
            <p className="mt-3 max-w-xs font-body text-sm leading-6 text-ink-soft">
              Take a look around Between Us and the Page before you make a
              notebook of your own.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:bg-ink hover:text-paper"
            aria-label="Close explore menu"
            title="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[17px] w-[17px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          <Link
            to="/explore#samples"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-white/30 px-4 py-4 transition hover:border-ink/20 hover:bg-white/55"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
              <svg
                viewBox="0 0 24 24"
                className="h-[17px] w-[17px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3V4.5Z" />
                <path d="M5 19.5a3 3 0 0 1 3-3h10" />
                <path d="M9 8h5" />
                <path d="M9 11h5" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-ink">Sample Works</span>
              <span className="mt-0.5 block font-body text-xs text-ink-soft">
                See how a finished journal can look.
              </span>
            </span>
            <span className="ml-auto text-ink-soft transition-transform group-hover:translate-x-1">→</span>
          </Link>

          <Link
            to="/explore#how-it-works"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl border border-ink/10 px-4 py-4 transition hover:border-ink/20 hover:bg-white/45"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink">
              <svg
                viewBox="0 0 24 24"
                className="h-[17px] w-[17px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l2.5 2" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-ink">How It Works</span>
              <span className="mt-0.5 block font-body text-xs text-ink-soft">
                A quick look at the journal experience.
              </span>
            </span>
            <span className="ml-auto text-ink-soft transition-transform group-hover:translate-x-1">→</span>
          </Link>

          <Link
            to="/explore#faqs"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl border border-ink/10 px-4 py-4 transition hover:border-ink/20 hover:bg-white/45"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 font-mono text-sm text-ink">
              ?
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg text-ink">FAQs</span>
              <span className="mt-0.5 block font-body text-xs text-ink-soft">
                Answers to the things you might wonder.
              </span>
            </span>
            <span className="ml-auto text-ink-soft transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-ink/10 pt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Ready to write?
          </p>
          <Link
            to="/register"
            onClick={onClose}
            className="btn-primary flex w-full items-center justify-center"
          >
            Start your first journal →
          </Link>
        </div>
      </aside>
    </div>
  );
}
