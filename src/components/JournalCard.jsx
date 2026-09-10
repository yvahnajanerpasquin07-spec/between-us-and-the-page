import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotebookCover from './NotebookCover';


export default function JournalCard({
  journal,
  readOnly = false,
  compactMobile = false,
  publicShareToken = null,
  onRemoveShared = null,
  selectionMode = false,
  selected = false,
  onStartSelection = null,
  onToggleSelection = null,
  navigationState = null,
}) {

  const navigate = useNavigate();
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const date = journal.journal_date
    ? new Date(`${journal.journal_date}T00:00:00`).toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
      )
    : '';

  function clearLongPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePointerDown(e) {
    if (selectionMode || e.pointerType !== 'touch' || readOnly || publicShareToken) {
      return;
    }

    longPressTriggered.current = false;

    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      onStartSelection?.(journal.id);
    }, 550);
  }

  function handlePointerUp() {
    clearLongPress();
  }

  function handlePointerCancel() {
    clearLongPress();
  }

  useEffect(() => clearLongPress, []);

  function handleClick() {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    if (selectionMode && onToggleSelection) {
      onToggleSelection(journal.id);
      return;
    }

    const journalPath =
      publicShareToken
        ? `/shared/${publicShareToken}/book`
        : navigationState?.fromBookcaseId
          ? `/journal/${journal.id}?fromBookcase=${encodeURIComponent(
              navigationState.fromBookcaseId
            )}`
          : `/journal/${journal.id}`;


    navigate(
      journalPath
    );
  }

  return (
    <motion.div
      layout
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onClick={handleClick}
      className={`
        relative
        aspect-[3/4]
        w-full
        cursor-pointer
        transition-transform
        duration-150
        hover:-translate-y-1
        ${selected ? 'journal-card-selected' : ''}
      `}
      whileTap={{ scale: 0.97 }}
      transition={{
        layout: {
          duration: 0.42,
          ease: [0.22, 0.61, 0.36, 1],
        },
      }}
    >

      <NotebookCover
        title={journal.title}
        description={journal.description}
        date={date}
        authorName={journal.author_name}
        coverColor={journal.cover_color}
        coverMaterial={journal.cover_material}
        spineColor={journal.spine_color}
        coverImageUrl={journal.cover_image_url}
        readOnly={readOnly}
        compactMobile={compactMobile}
      />

      {selectionMode && !readOnly && !publicShareToken && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.(journal.id);
          }}
          className={`
            absolute
            right-2
            top-2
            z-30
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            shadow-md
            transition
            ${
              selected
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/30 bg-paper/90 text-transparent hover:border-ink/60'
            }
          `}
          aria-label={selected ? 'Deselect book' : 'Select book'}
          title={selected ? 'Deselect book' : 'Select book'}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </button>
      )}

      {onRemoveShared && journal.access_id && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveShared(journal.access_id);
          }}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 bg-paper/90 text-ink-soft shadow-sm transition hover:border-ink/30 hover:bg-paper hover:text-ink"
          aria-label="Remove from Shared with you"
          title="Remove from Shared with you"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
      )}

    </motion.div>
  );
}
