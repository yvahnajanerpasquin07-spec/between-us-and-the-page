import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  deleteJournal,
  getJournal,
} from '../services/journalService';

import {
  createPoem,
  getPoemsForJournal,
} from '../services/poemService';

import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';

import NotebookCover, {
  InsideCoverPanel,
} from '../components/NotebookCover';

import Button from '../components/Button';
import Loading from '../components/Loading';
import ShareModal from '../components/ShareModal';


const PAGE_W = 360;
const PAGE_H = 480;

const TURN_DURATION = 0.72;


/* =========================================================
   JOURNAL
========================================================= */

export default function Journal() {

  const { journalId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  /* =========================================================
     UI STATE
  ========================================================= */

  /*
    Book states:

    closed-front
    opening
    open
    closing
    closed-back
  */

  const [bookState, setBookState] =
    useState('closed-front');

  const [pageView, setPageView] =
    useState({
      type: 'toc',
    });

  const [pageDirection, setPageDirection] =
    useState(1);

  /*
    Stores the page that is physically being turned.

    null
      = no page animation

    {
      direction: 1 | -1,
      view: previous page
    }
  */

  const [turningPage, setTurningPage] =
    useState(null);

  const [showShare, setShowShare] =
    useState(false);

  const [showCoverMenu, setShowCoverMenu] =
    useState(false);


  const isOpen =
    bookState === 'open';

  const isAnimating =
    bookState === 'opening' ||
    bookState === 'closing' ||
    turningPage !== null;


  /* =========================================================
     DATA
  ========================================================= */

  const {
    data: journal,
    loading: journalLoading,
  } = useAsync(
    () => getJournal(journalId),
    [journalId]
  );


  const {
    data: poems,
    loading: poemsLoading,
  } = useAsync(
    () => getPoemsForJournal(journalId),
    [journalId]
  );


  const isOwner =
    journal &&
    user &&
    journal.owner_id === user.id;


  /* =========================================================
     ACTIONS
  ========================================================= */

  async function handleNewPoem() {

    const poem = await createPoem({
      journalId,

      title: 'Untitled',

      content: '',

      displayOrder:
        poems?.length ?? 0,
    });

    navigate(
      `/journal/${journalId}/poem/${poem.id}`
    );
  }


  async function handleDeleteJournal() {

    if (
      !confirm(
        'Delete this journal and all its poems? This cannot be undone.'
      )
    ) {
      return;
    }

    await deleteJournal(journalId);

    navigate('/dashboard');
  }


  /* =========================================================
     COVER
  ========================================================= */

  const date = journal
    ? new Date(
        journal.created_at
      ).toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }
      )
    : '';


  const coverFront = journal ? (

    <NotebookCover
      title={journal.title}
      description={journal.description}
      date={date}
      coverColor={journal.cover_color}
      coverMaterial={journal.cover_material}
      coverImageUrl={journal.cover_image_url}
    />

  ) : null;


  const insideCover = journal ? (

    <InsideCoverPanel
      coverColor={journal.cover_color}
      coverMaterial={journal.cover_material}
    />

  ) : null;


  /* =========================================================
     OPEN BOOK
  ========================================================= */

  function openBook() {

    if (
      bookState !== 'closed-front' ||
      isAnimating
    ) {
      return;
    }

    setShowCoverMenu(false);

    setBookState('opening');

    /*
      IMPORTANT:

      The open-book is already rendered underneath
      the cover.

      The cover itself remains mounted for the entire
      720ms animation.

      This fixes the old problem where isOpen became true
      after only 350ms and destroyed the animation.
    */

    window.setTimeout(() => {

      setBookState('open');

    }, 720);
  }


  /* =========================================================
     CLOSE BOOK
  ========================================================= */

  function closeBook() {

    if (
      bookState !== 'open' ||
      isAnimating
    ) {
      return;
    }

    /*
      A physical book closes from the back cover.

      So first put the visible spread on the back cover,
      then animate that back cover shut.
    */

    setPageView({
      type: 'back',
    });

    setTurningPage(null);

    setBookState('closing');

    window.setTimeout(() => {

      setBookState('closed-back');

    }, 720);
  }


  /* =========================================================
     REOPEN FROM BACK
  ========================================================= */

  function reopenFromBack() {

    if (
      bookState !== 'closed-back' ||
      isAnimating
    ) {
      return;
    }

    /*
      Start from the back-cover spread.

      Previous button can then travel back through
      the poems.
    */

    setPageView({
      type: 'back',
    });

    setBookState('open');
  }


  /* =========================================================
     PAGE TURN
  ========================================================= */

  function turnTo(
    nextView,
    direction
  ) {

    if (
      !isOpen ||
      isAnimating
    ) {
      return;
    }

    /*
      Save the page currently visible.

      The saved page becomes the physical sheet
      that rotates.
    */

    setTurningPage({
      view: pageView,

      direction,
    });

    setPageDirection(direction);

    /*
      The new page is rendered underneath.
    */

    setPageView(nextView);

    /*
      Remove the physical turning sheet after
      the animation completes.
    */

    window.setTimeout(() => {

      setTurningPage(null);

    }, TURN_DURATION * 1000);
  }


  /* =========================================================
     NEXT PAGE
  ========================================================= */

  function goNext() {

    if (
      !isOpen ||
      isAnimating
    ) {
      return;
    }


    /* -----------------------------------------
       TOC → FIRST POEM
    ----------------------------------------- */

    if (pageView.type === 'toc') {

      if (!poems?.length) {
        return;
      }

      turnTo(
        {
          type: 'poem',
          index: 0,
        },
        1
      );

      return;
    }


    /* -----------------------------------------
       POEM → NEXT POEM
    ----------------------------------------- */

    if (pageView.type === 'poem') {

      if (
        pageView.index <
        poems.length - 1
      ) {

        turnTo(
          {
            type: 'poem',
            index:
              pageView.index + 1,
          },
          1
        );

      } else {

        /*
          Last poem → back cover
        */

        turnTo(
          {
            type: 'back',
          },
          1
        );
      }

      return;
    }


    /*
      At back cover there is nowhere
      further forward to go.
    */

  }


  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  function goPrevious() {

    if (
      !isOpen ||
      isAnimating
    ) {
      return;
    }


    /* -----------------------------------------
       BACK COVER → LAST POEM
    ----------------------------------------- */

    if (
      pageView.type === 'back'
    ) {

      if (!poems?.length) {
        return;
      }

      turnTo(
        {
          type: 'poem',
          index:
            poems.length - 1,
        },
        -1
      );

      return;
    }


    /* -----------------------------------------
       POEM → PREVIOUS POEM
    ----------------------------------------- */

    if (
      pageView.type === 'poem'
    ) {

      if (
        pageView.index > 0
      ) {

        turnTo(
          {
            type: 'poem',
            index:
              pageView.index - 1,
          },
          -1
        );

      } else {

        /*
          First poem → TOC
        */

        turnTo(
          {
            type: 'toc',
          },
          -1
        );
      }

      return;
    }


    /*
      TOC is the first page.
    */

  }


  /* =========================================================
     PAGE CONTENT
  ========================================================= */

  function renderPageContent(view) {

    /* -----------------------------------------
       TABLE OF CONTENTS
    ----------------------------------------- */

    if (
      view.type === 'toc'
    ) {

      return (
        <TocPage
          journal={journal}
          poems={poems}
          poemsLoading={poemsLoading}
          isOwner={isOwner}

          onSelectPoem={(index) => {

            turnTo(
              {
                type: 'poem',
                index,
              },
              1
            );

          }}

          onExit={closeBook}

          onShare={() =>
            setShowShare(true)
          }

          onNewPoem={
            handleNewPoem
          }
        />
      );
    }


    /* -----------------------------------------
       BACK COVER
    ----------------------------------------- */

    if (
      view.type === 'back'
    ) {

      return (
        <NotebookBackCover
          journal={journal}
        />
      );
    }


    /* -----------------------------------------
       POEM
    ----------------------------------------- */

    const poem =
      poems?.[view.index];

    if (!poem) {
      return null;
    }


    return (
      <PoemPage
        poem={poem}
        journalId={journalId}
        isOwner={isOwner}

        onNext={goNext}
        onPrev={goPrevious}

        hasNext={
          view.index <
          (poems?.length ?? 1) - 1
        }

        pageNumber={
          view.index + 1
        }

        totalPages={
          poems?.length ?? 0
        }
      />
    );
  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (journalLoading) {

    return (
      <Loading
        label="Opening journal"
      />
    );
  }


  if (!journal) {

    return (
      <p className="p-6">
        Journal not found.
      </p>
    );
  }


  /* =========================================================
     LEFT PAGE
  ========================================================= */

  function renderLeftPage() {

    /*
      TOC:
        left side = inside front cover

      FIRST POEM:
        left side = backside of TOC

      POEM 2+:
        left side = backside of previous page

      BACK COVER:
        left side = backside of last poem
    */

    if (
      pageView.type === 'toc'
    ) {

      return (
        <div className="book-left-page">

          <InsideCoverPanel
            coverColor={
              journal.cover_color
            }

            coverMaterial={
              journal.cover_material
            }
          />

        </div>
      );
    }


    return (
      <div className="book-left-page">

        <div className="page-back">

          <div className="page-back-inner" />

        </div>

      </div>
    );
  }


  /* =========================================================
     PAGE TURNING SHEET
  ========================================================= */

  function renderTurningPage() {

    if (!turningPage) {
      return null;
    }


    const isForward =
      turningPage.direction > 0;


    return (
      <motion.div
        className={
          `page-turn-layer ${
            isForward
              ? 'forward'
              : 'backward'
          }`
        }

        initial={{
          rotateY: 0,
        }}

        animate={{
          rotateY:
            isForward
              ? -180
              : 180,
        }}

        transition={{
          duration:
            TURN_DURATION,

          ease:
            [0.22, 0.61, 0.36, 1],
        }}
      >

        <div
          className="
            page-turn-face
            page-turn-front
          "
        >

          {renderPageContent(
            turningPage.view
          )}

        </div>


        <div
          className="
            page-turn-face
            page-turn-back
          "
        >

          <div
            className="
              page-turn-back-inner
            "
          />

        </div>

      </motion.div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      className="journal-page"

      onClick={() => {

        if (showCoverMenu) {
          setShowCoverMenu(false);
        }

      }}
    >

      {/* ================================================
          HEADER
      ================================================ */}

      <div className="journal-header">

        <h1>
          Between Us and the Page
        </h1>

        <div className="journal-header-links">

          <span>
            My Library
          </span>

          <span>
            Sign out
          </span>

        </div>

      </div>


      {/* ================================================
          DELETE
      ================================================ */}

      {isOwner && (

        <button
          className="delete-journal"

          onClick={(e) => {

            e.stopPropagation();

            handleDeleteJournal();

          }}
        >
          DELETE JOURNAL
        </button>

      )}


      {/* ================================================
          BOOK CONTROLS
      ================================================ */}

      <div className="book-controls">

        {/* --------------------------------------------
            PREVIOUS
        -------------------------------------------- */}

        <button
          disabled={
            !isOpen ||
            isAnimating ||
            pageView.type === 'toc'
          }

          onClick={goPrevious}
        >
          ← PREVIOUS
        </button>


        {/* --------------------------------------------
            CURRENT LOCATION
        -------------------------------------------- */}

        <span>

          {bookState === 'closed-front' &&
            'Closed'}

          {bookState === 'opening' &&
            'Opening…'}

          {bookState === 'closing' &&
            'Closing…'}

          {bookState === 'closed-back' &&
            'Back Cover'}

          {bookState === 'open' &&
            (
              pageView.type === 'toc'
                ? 'Table of Contents'

                : pageView.type === 'back'
                  ? 'Back Cover'

                  : `Page ${
                      pageView.index + 1
                    } of ${
                      poems?.length ?? 0
                    }`
            )}

        </span>


        {/* --------------------------------------------
            NEXT / OPEN / CLOSE
        -------------------------------------------- */}

        <button

          disabled={
            isAnimating ||
            (
              isOpen &&
              pageView.type === 'back'
            )
          }

          onClick={() => {

            if (
              bookState ===
              'closed-front'
            ) {

              openBook();

              return;
            }


            if (
              bookState ===
              'closed-back'
            ) {

              reopenFromBack();

              return;
            }


            if (
              isOpen
            ) {

              goNext();

            }

          }}
        >

          {bookState === 'closed-front'
            ? 'OPEN →'

            : bookState === 'closed-back'
              ? 'OPEN ←'

              : 'NEXT →'}

        </button>


        {/* --------------------------------------------
            CLOSE
        -------------------------------------------- */}

        {isOpen && (

          <button
            disabled={
              isAnimating
            }

            onClick={
              closeBook
            }
          >
            CLOSE
          </button>

        )}

      </div>


      {/* ================================================
          BOOK
      ================================================ */}

      <div
        className={`
          book-wrapper
          ${
            bookState === 'opening'
              ? 'is-opening'
              : ''
          }
          ${
            bookState === 'closing'
              ? 'is-closing'
              : ''
          }
          ${
            bookState === 'open'
              ? 'is-open'
              : ''
          }
        `}
      >


        {/* ==========================================
            CLOSED FRONT
        ========================================== */}

        {bookState ===
          'closed-front' && (

          <div
            className="closed-book"

            onClick={
              openBook
            }

            onContextMenu={(e) => {

              e.preventDefault();

              if (isOwner) {
                setShowCoverMenu(
                  true
                );
              }

            }}
          >

            {coverFront}


            {showCoverMenu && (

              <div
                className="cover-menu"

                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <button
                  onClick={() => {

                    setShowCoverMenu(
                      false
                    );

                    handleDeleteJournal();

                  }}
                >
                  Delete journal
                </button>

              </div>

            )}

          </div>

        )}


        {/* ==========================================
            CLOSED BACK
        ========================================== */}

        {bookState ===
          'closed-back' && (

          <div
            className="closed-book"

            onClick={
              reopenFromBack
            }
          >

            <div
              className="closed-back-cover"

              style={{
                backgroundColor:
                  journal.cover_color,
              }}
            >

              <div
                className="
                  closed-back-cover-title
                "
              >
                {journal.title}
              </div>

            </div>

          </div>

        )}


        {/* ==========================================
            OPEN BOOK
        ========================================== */}

        {(
          bookState === 'opening' ||
          bookState === 'open' ||
          bookState === 'closing'
        ) && (

          <div className="open-book">


            {/* --------------------------------------
                LEFT SIDE
            -------------------------------------- */}

            {renderLeftPage()}


            {/* --------------------------------------
                RIGHT SIDE
            -------------------------------------- */}

            <div
              className="
                book-right-page
              "
            >

              {renderPageContent(
                pageView
              )}

            </div>


            {/* --------------------------------------
                PAGE TURN
            -------------------------------------- */}

            {renderTurningPage()}


            {/* ======================================
                FRONT COVER OPENING
            ====================================== */}

            {bookState ===
              'opening' && (

              <motion.div
                className="
                  animated-cover
                "

                initial={{
                  rotateY: 0,
                }}

                animate={{
                  rotateY: -180,
                }}

                transition={{
                  duration: 0.72,

                  ease:
                    [0.22, 0.61, 0.36, 1],
                }}

                style={{
                  transformOrigin:
                    'left center',
                }}
              >

                <div
                  className="
                    cover-front-face
                  "
                >

                  {coverFront}

                </div>


                <div
                  className="
                    cover-back-face
                  "
                >

                  {insideCover}

                </div>

              </motion.div>

            )}


            {/* ======================================
                BACK COVER CLOSING
            ====================================== */}

            {bookState ===
              'closing' && (

              <motion.div
                className="
                  animated-back-cover
                "

                initial={{
                  rotateY: 0,
                }}

                animate={{
                  rotateY: -180,
                }}

                transition={{
                  duration: 0.72,

                  ease:
                    [0.22, 0.61, 0.36, 1],
                }}

                style={{
                  transformOrigin:
                    'left center',
                }}
              >

                {/* INSIDE OF BACK COVER */}

                <div
                  className="
                    back-cover-animation-face
                    back-cover-animation-front
                  "
                >

                  <NotebookBackCover
                    journal={journal}
                  />

                </div>


                {/* OUTSIDE OF BACK COVER */}

                <div
                  className="
                    back-cover-animation-face
                    back-cover-animation-back
                  "
                >

                  <div
                    className="
                      closed-back-cover
                    "

                    style={{
                      backgroundColor:
                        journal.cover_color,
                    }}
                  >

                    <div
                      className="
                        closed-back-cover-title
                      "
                    >
                      {journal.title}
                    </div>

                  </div>

                </div>

              </motion.div>

            )}

          </div>

        )}

      </div>


      {/* ================================================
          SHARE
      ================================================ */}

      {showShare && (

        <ShareModal
          journalId={
            journalId
          }

          onClose={() =>
            setShowShare(false)
          }
        />

      )}

    </div>
  );
}


/* =========================================================
   TABLE OF CONTENTS
========================================================= */

function TocPage({
  journal,
  poems,
  poemsLoading,
  isOwner,
  onSelectPoem,
  onExit,
  onShare,
  onNewPoem,
}) {

  return (

    <div className="page-inner">

      <h2>
        {journal.title}
      </h2>

      <p className="page-label">
        TABLE OF CONTENTS
      </p>


      <div className="toc-list">

        {poemsLoading ? (

          <Loading
            label="Turning pages"
          />

        ) : poems?.length ? (

          poems.map(
            (poem, index) => (

              <button
                key={poem.id}

                onClick={() =>
                  onSelectPoem(
                    index
                  )
                }

                className="toc-item"
              >

                <span>

                  {index + 1}.
                  {' '}

                  {poem.title ||
                    'Untitled'}

                </span>


                <span>

                  {poem.poem_date ||
                    ''}

                </span>

              </button>

            )
          )

        ) : (

          <p className="empty-text">
            No poems in this journal yet.
          </p>

        )}

      </div>


      <div className="page-footer">

        <button
          onClick={onExit}

          className="text-button"
        >
          ← CLOSE JOURNAL
        </button>


        {isOwner && (

          <div className="footer-buttons">

            <Button
              variant="secondary"

              onClick={onShare}
            >
              Share
            </Button>


            <Button
              onClick={onNewPoem}
            >
              New Poem
            </Button>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   POEM PAGE
========================================================= */

function PoemPage({
  poem,
  journalId,
  isOwner,
  onNext,
  onPrev,
  hasNext,
  pageNumber,
  totalPages,
}) {

  const navigate =
    useNavigate();


  return (

    <div
      className="
        page-inner
        poem-page
      "
    >

      <div>

        <h2>
          {poem.title ||
            'Untitled'}
        </h2>


        {poem.poem_date && (

          <p className="page-label">
            {poem.poem_date}
          </p>

        )}

      </div>


      <div className="poem-text">

        {poem.content}

      </div>


      {isOwner && (

        <button

          onClick={() =>
            navigate(
              `/journal/${journalId}/poem/${poem.id}`
            )
          }

          className="
            edit-button
          "
        >
          EDIT THIS PAGE
        </button>

      )}


      <div className="page-footer">

        <button
          onClick={onPrev}

          className="text-button"
        >
          ← Previous
        </button>


        <span
          className="page-number"
        >
          Page {pageNumber} of {totalPages}
        </span>


        <button
          onClick={onNext}

          disabled={!hasNext}

          className="text-button"
        >
          Next →
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   BACK COVER
========================================================= */

function NotebookBackCover({
  journal,
}) {

  return (

    <div className="back-cover-page">

      <div
        className="back-cover-design"

        style={{
          backgroundColor:
            journal.cover_color,
        }}
      >

        <div
          className="
            back-cover-title
          "
        >
          {journal.title}
        </div>

      </div>

    </div>

  );
}