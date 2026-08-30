import { useState } from 'react';
import NotebookCover, {
  InsideCoverPanel,
} from './NotebookCover';

const PAGE_W = 360;
const PAGE_H = 480;

export default function ThreeDBook({
  journal,
  poems = [],
  isOwner,
  poemsLoading,
  onNewPoem,
  onShare,
  onEditPoem,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [turning, setTurning] = useState(false);

  const date = new Date(journal.created_at).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  /*
  ============================================================
  OPEN BOOK
  ============================================================

  Page 0 = Table of Contents
  Page 1 = Poem 1
  Page 2 = Poem 2
  ...
  Last page = Back Cover
  */

  const totalPages = poems.length + 2;

  function openBook() {
    if (turning) return;

    setTurning(true);

    setTimeout(() => {
      setIsOpen(true);
      setTurning(false);
    }, 700);
  }

  function closeBook() {
    if (turning) return;

    setTurning(true);

    setTimeout(() => {
      setIsOpen(false);
      setCurrentPage(0);
      setTurning(false);
    }, 700);
  }

  function nextPage() {
    if (turning) return;

    if (currentPage >= totalPages - 1) return;

    setTurning(true);

    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setTurning(false);
    }, 700);
  }

  function previousPage() {
    if (turning) return;

    if (currentPage <= 0) {
      closeBook();
      return;
    }

    setTurning(true);

    setTimeout(() => {
      setCurrentPage((p) => p - 1);
      setTurning(false);
    }, 700);
  }

  return (
    <div className="book-area">

      {/* =====================================================
          CONTROLS
      ====================================================== */}

      <div className="book-controls">

        <button
          onClick={previousPage}
          disabled={!isOpen || turning}
        >
          ← PREVIOUS
        </button>

        <span>
          {!isOpen
            ? 'Closed'
            : `Page ${currentPage + 1} of ${totalPages}`}
        </span>

        <button
          onClick={isOpen ? nextPage : openBook}
          disabled={turning}
        >
          {isOpen ? 'NEXT →' : 'OPEN →'}
        </button>

      </div>


      {/* =====================================================
          BOOK
      ====================================================== */}

      <div
        className={`book ${
          isOpen ? 'book-is-open' : 'book-is-closed'
        }`}
      >

        {/* =================================================
            LEFT SIDE

            This is where the inside cover / blank pages live.
        ================================================== */}

        <div className="book-left">

          {!isOpen ? (
            /*
              Nothing here while closed.
              The front cover sits separately.
            */
            <div />
          ) : currentPage === 0 ? (

            /*
              FIRST OPEN PAGE:
              INSIDE OF COVER
            */

            <InsideCoverPanel
              coverColor={journal.cover_color}
              coverMaterial={journal.cover_material}
            />

          ) : (

            /*
              AFTER FIRST PAGE:
              LEFT SIDE IS ALWAYS BLANK FOR NOW.
            */

            <div className="blank-book-page" />

          )}

        </div>


        {/* =================================================
            RIGHT SIDE

            TOC / POEMS / BACK COVER
        ================================================== */}

        <div className="book-right">

          {!isOpen ? null : (
            <RightPage
              journal={journal}
              poems={poems}
              poemsLoading={poemsLoading}
              currentPage={currentPage}
              isOwner={isOwner}
              onNewPoem={onNewPoem}
              onShare={onShare}
              onEditPoem={onEditPoem}
            />
          )}

        </div>


        {/* =================================================
            FRONT COVER

            CLOSED:
              sits on the right/center.

            OPEN:
              rotates around its RIGHT edge
              and lands on the LEFT.
        ================================================== */}

        <div
          className={`front-cover ${
            isOpen ? 'front-cover-open' : ''
          }`}
          onClick={!isOpen ? openBook : undefined}
        >

          <NotebookCover
            title={journal.title}
            description={journal.description}
            date={date}
            coverColor={journal.cover_color}
            coverMaterial={journal.cover_material}
            coverImageUrl={journal.cover_image_url}
          />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   RIGHT PAGE CONTENT
============================================================ */

function RightPage({
  journal,
  poems,
  poemsLoading,
  currentPage,
  isOwner,
  onNewPoem,
  onShare,
  onEditPoem,
}) {

  /*
  ============================================================
  TABLE OF CONTENTS
  ============================================================
  */

  if (currentPage === 0) {
    return (
      <div className="book-page-content">

        <h2 className="font-display text-2xl">
          {journal.title}
        </h2>

        <p className="mb-6 font-mono text-xs uppercase tracking-wide text-ink-soft">
          Table of contents
        </p>

        <div className="flex-1 overflow-y-auto">

          {poemsLoading ? (

            <p className="font-body text-ink-soft">
              Loading poems...
            </p>

          ) : poems.length ? (

            <ul className="divide-y divide-ink/10">

              {poems.map((poem, index) => (

                <li
                  key={poem.id}
                  className="py-3"
                >

                  <div className="flex justify-between">

                    <span className="font-body">
                      {index + 1}.{' '}
                      {poem.title || 'Untitled'}
                    </span>

                    <span className="font-mono text-xs text-ink-soft">
                      {poem.poem_date || ''}
                    </span>

                  </div>

                </li>

              ))}

            </ul>

          ) : (

            <p className="font-body text-ink-soft">
              No poems in this journal yet.
            </p>

          )}

        </div>


        {isOwner && (

          <div className="mt-4 flex gap-2 border-t border-ink/10 pt-4">

            <button
              onClick={onShare}
              className="btn-secondary"
            >
              Share
            </button>

            <button
              onClick={onNewPoem}
              className="btn-primary"
            >
              New Poem
            </button>

          </div>

        )}

      </div>
    );
  }


  /*
  ============================================================
  POEM PAGES
  ============================================================
  */

  const poemIndex = currentPage - 1;

  if (
    poemIndex >= 0 &&
    poemIndex < poems.length
  ) {

    const poem = poems[poemIndex];

    return (
      <div className="book-page-content">

        <div>

          <h2 className="font-display text-2xl">
            {poem.title || 'Untitled'}
          </h2>

          {poem.poem_date && (

            <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-soft">
              {poem.poem_date}
            </p>

          )}

        </div>


        <div className="mt-6 flex-1 overflow-y-auto">

          <p className="whitespace-pre-line font-body leading-relaxed">
            {poem.content}
          </p>

        </div>


        {isOwner && (

          <button
            onClick={() => onEditPoem(poem)}
            className="mt-4 self-start font-mono text-xs uppercase tracking-wide text-margin"
          >
            Edit this page
          </button>

        )}

      </div>
    );
  }


  /*
  ============================================================
  BACK COVER
  ============================================================
  */

  return (
    <div className="back-cover-content">

      <h2 className="font-display text-3xl">
        {journal.title}
      </h2>

      <p className="mt-3 font-body text-ink-soft">
        The end.
      </p>


      {isOwner && (

        <button className="btn-secondary mt-8">
          Customize Cover
        </button>

      )}

    </div>
  );
}