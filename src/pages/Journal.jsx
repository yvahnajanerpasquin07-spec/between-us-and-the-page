import {
  useState,
  useRef,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import {
  deleteJournal,
  getJournal,
} from '../services/journalService';

import {
  createPoem,
  getPoemsForJournal,
  updatePoemWidgetBox,
  uploadPoemImage,
  updatePoemImageBox,
} from '../services/poemService';

import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';

import NotebookCover, {
  InsideCoverPanel,
} from '../components/NotebookCover';

import Button from '../components/Button';
import Loading from '../components/Loading';
import ShareModal from '../components/ShareModal';
import SpotifyPlayer from '../components/SpotifyPlayer';
import DraggableWidget from '../components/DraggableWidget';
import EditJournalModal from '../components/EditJournalModal';


/* =========================================================
   CONSTANTS
========================================================= */

const TURN_DURATION = 720;


/* =========================================================
   JOURNAL
========================================================= */

export default function Journal() {

  const { journalId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  /*
    LOCATION

    1 = CLOSED FRONT COVER

    2 = INSIDE COVER | TABLE OF CONTENTS

    3 = POEM 1 MEDIA | POEM 1

    4 = POEM 2 MEDIA | POEM 2

    ...

    poems.length + 3
        = BLANK PAGE | INSIDE BACK COVER

    poems.length + 4
        = CLOSED BACK COVER
  */

  const [currentLocation, setCurrentLocation] =
    useState(1);


  const [flippedPapers, setFlippedPapers] =
    useState(() => new Set());


  const [isTurning, setIsTurning] =
    useState(false);


  const turningPaperRef =
    useRef(null);


  const locationRef =
    useRef(1);


  const [showShare, setShowShare] =
    useState(false);


  const [showCoverMenu, setShowCoverMenu] =
    useState(false);


  const [showEditModal, setShowEditModal] =
    useState(false);


  const [journalOverride, setJournalOverride] =
    useState(null);


  /*
    IMAGE WIDGETS
  */

  const [imageWidgets, setImageWidgets] =
    useState(() => {

      try {

        return JSON.parse(
          localStorage.getItem(
            'imageWidgets'
          ) || '{}'
        );

      } catch {

        return {};

      }

    });


  const leftPageRef =
    useRef(null);


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


  const activeJournal =
    journalOverride ?? journal;


  const isOwner =
    journal &&
    user &&
    journal.owner_id === user.id;


  locationRef.current =
    currentLocation;


  const maxLocation =
    (poems?.length ?? 0) + 4;


  const isClosedFront =
    currentLocation === 1;


  const isClosedBack =
    currentLocation === maxLocation;


  const isOpen =
    !isClosedFront &&
    !isClosedBack;


  const date =
    activeJournal
      ? new Date(
          activeJournal.created_at
        ).toLocaleDateString(
          undefined,
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )
      : '';


  /* =========================================================
     COVER
  ========================================================= */

  const coverFront =
    activeJournal ? (

      <NotebookCover
        title={
          activeJournal.title
        }
        description={
          activeJournal.description
        }
        date={date}
        authorName={
          activeJournal.author_name
        }
        coverColor={
          activeJournal.cover_color
        }
        coverMaterial={
          activeJournal.cover_material
        }
        coverImageUrl={
          activeJournal.cover_image_url
        }
      />

    ) : null;


  /*
    INSIDE FRONT COVER

    Completely blank.
    No spine.
  */

  const insideCover =
    activeJournal ? (

      <InsideCoverPanel
        coverColor={
          activeJournal.cover_color
        }
        coverMaterial={
          activeJournal.cover_material
        }
      />

    ) : null;


  /* =========================================================
     CREATE POEM
  ========================================================= */

  async function handleNewPoem() {

    const poem =
      await createPoem({

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


  /* =========================================================
     DELETE JOURNAL
  ========================================================= */

  async function handleDeleteJournal() {

    if (
      !confirm(
        'Delete this journal and all its poems? This cannot be undone.'
      )
    ) {

      return;

    }


    await deleteJournal(
      journalId
    );


    navigate('/dashboard');

  }


  /* =========================================================
     IMAGE WIDGET
  ========================================================= */

  function saveImageWidget(
    poemId,
    next
  ) {

    setImageWidgets(
      (prev) => {

        const nextMap = {
          ...prev,
          [poemId]: next,
        };


        try {

          localStorage.setItem(
            'imageWidgets',
            JSON.stringify(
              nextMap
            )
          );

        } catch {
          // Ignore localStorage errors.
        }


        return nextMap;

      }
    );


    if (isOwner) {

      updatePoemImageBox(
        poemId,
        next
      ).catch(() => {});

    }

  }


  async function addImageForPoem(
    poemId,
    file
  ) {

    try {

      const url =
        await uploadPoemImage(
          journalId,
          poemId,
          file
        );


      const defaultBox = {

        x: 20,

        y: 20,

        w: 220,

        h: 140,

        url,

      };


      saveImageWidget(
        poemId,
        defaultBox
      );

    } catch (error) {

      console.error(
        'Upload failed',
        error
      );


      alert(
        'Image upload failed.'
      );

    }

  }


  /* =========================================================
     PAGE TURN
  ========================================================= */

  function finishTurn() {

    turningPaperRef.current =
      null;

    setIsTurning(false);

  }


  function turnForwardOne() {

    if (isTurning) {
      return;
    }


    const location =
      locationRef.current;


    if (
      location >= maxLocation
    ) {

      return;

    }


    const paperId =
      location;


    turningPaperRef.current =
      paperId;


    setIsTurning(true);


    setFlippedPapers(
      (prev) => {

        const next =
          new Set(prev);

        next.add(paperId);

        return next;

      }
    );


    const nextLocation =
      location + 1;


    locationRef.current =
      nextLocation;


    setCurrentLocation(
      nextLocation
    );


    window.setTimeout(
      finishTurn,
      TURN_DURATION
    );

  }


  function turnBackwardOne() {

    if (isTurning) {
      return;
    }


    const location =
      locationRef.current;


    if (location <= 1) {
      return;

    }


    const paperId =
      location - 1;


    turningPaperRef.current =
      paperId;


    setIsTurning(true);


    setFlippedPapers(
      (prev) => {

        const next =
          new Set(prev);

        next.delete(paperId);

        return next;

      }
    );


    const nextLocation =
      location - 1;


    locationRef.current =
      nextLocation;


    setCurrentLocation(
      nextLocation
    );


    window.setTimeout(
      finishTurn,
      TURN_DURATION
    );

  }


  function goNextPage() {

    turnForwardOne();

  }


  function goPreviousPage() {

    turnBackwardOne();

  }


  /* =========================================================
     GO TO POEM FROM TOC
  ========================================================= */

  function goToPoem(
    poemIndex
  ) {

    if (isTurning) {
      return;
    }


    const target =
      poemIndex + 3;


    if (
      target <=
      locationRef.current
    ) {

      return;

    }


    const turnNext =
      () => {

        const location =
          locationRef.current;


        if (
          location >= target
        ) {

          return;

        }


        const paperId =
          location;


        turningPaperRef.current =
          paperId;


        setIsTurning(true);


        setFlippedPapers(
          (prev) => {

            const next =
              new Set(prev);

            next.add(paperId);

            return next;

          }
        );


        const nextLocation =
          location + 1;


        locationRef.current =
          nextLocation;


        setCurrentLocation(
          nextLocation
        );


        window.setTimeout(
          () => {

            turningPaperRef.current =
              null;

            setIsTurning(false);


            if (
              locationRef.current <
              target
            ) {

              turnNext();

            }

          },
          TURN_DURATION + 50
        );

      };


    turnNext();

  }


  /* =========================================================
     LEFT MEDIA PAGE
  ========================================================= */

  function renderLeftPage(
    poem
  ) {

    if (!poem) {

      return (

        <div className="book-left-page">

          {insideCover}

        </div>

      );

    }


    return (

      <div className="book-left-page">

        <div
          className="page-back"
          ref={leftPageRef}
        >

          <div className="page-back-inner">

            {imageWidgets[
              poem.id
            ] ? (

              <DraggableWidget
                key={`${poem.id}-img`}
                containerRef={
                  leftPageRef
                }
                editable={
                  isOwner
                }
                initial={
                  imageWidgets[
                    poem.id
                  ]
                }
                onSave={(box) => {

                  saveImageWidget(
                    poem.id,
                    {
                      ...box,

                      url:
                        imageWidgets[
                          poem.id
                        ].url,
                    }
                  );

                }}
              >

                <img
                  src={
                    imageWidgets[
                      poem.id
                    ].url
                  }
                  alt="page image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

              </DraggableWidget>

            ) : poem.spotify_url ? (

              <DraggableWidget
                key={`${poem.id}-spotify`}
                containerRef={
                  leftPageRef
                }
                editable={
                  isOwner
                }
                initial={
                  poem.spotify_widget_box ??
                  undefined
                }
                onSave={(box) => {

                  updatePoemWidgetBox(
                    poem.id,
                    box
                  ).catch(
                    () => {}
                  );

                }}
              >

                <SpotifyPlayer
                  spotifyUrl={
                    poem.spotify_url
                  }
                  active
                />

              </DraggableWidget>

            ) : (

              <p className="empty-left-page">

                No song, link, or picture
                added to this page yet.

              </p>

            )}

          </div>

        </div>

      </div>

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
     BUILD PAPERS
  ========================================================= */

  const papers = [];


  /* =========================================================
     PAPER 1
  ========================================================= */

  papers.push({

    id: 1,

    front: (

      <div
        className="closed-book"
        onClick={(e) => {

          e.stopPropagation();


          if (
            isClosedFront &&
            !isTurning
          ) {

            goNextPage();

          }

        }}
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

                setShowEditModal(
                  true
                );

              }}
            >

              Edit journal

            </button>


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

    ),


    back: (

      <div className="book-left-page">

        {insideCover}

      </div>

    ),

  });


  /* =========================================================
     PAPER 2
  ========================================================= */

  papers.push({

    id: 2,

    front: (

      <div className="book-right-page">

        <TocPage
          journal={
            activeJournal
          }
          poems={poems}
          poemsLoading={
            poemsLoading
          }
          isOwner={isOwner}
          onSelectPoem={
            goToPoem
          }
          onExit={
            goPreviousPage
          }
          onShare={() =>
            setShowShare(true)
          }
          onNewPoem={
            handleNewPoem
          }
        />

      </div>

    ),


    back:
      poems?.length
        ? renderLeftPage(
            poems[0]
          )
        : (

          <div className="book-left-page">

            {insideCover}

          </div>

        ),

  });


  /* =========================================================
     POEM PAPERS
  ========================================================= */

  poems?.forEach(
    (poem, index) => {

      const nextPoem =
        poems[index + 1];


      papers.push({

        id: index + 3,


        front: (

          <div className="book-right-page">

            <PoemPage
              poem={poem}
              journalId={
                journalId
              }
              isOwner={
                isOwner
              }
              onNext={
                goNextPage
              }
              onPrev={
                goPreviousPage
              }
              hasNext={
                index <
                poems.length - 1
              }
              pageNumber={
                index + 1
              }
              totalPages={
                poems.length
              }
            />

          </div>

        ),


        back: nextPoem
          ? renderLeftPage(
              nextPoem
            )
          : (

            <div className="book-left-page">

              <div className="blank-paper-page" />

            </div>

          ),

      });

    }
  );


  /* =========================================================
     FINAL PAPER
  ========================================================= */

  const finalPaperId =
    papers.length + 1;


  papers.push({

    id: finalPaperId,


    front: (

      <div className="book-right-page">

        <InsideBackCover
          journal={
            activeJournal
          }
        />

      </div>

    ),


    back: (

      <ClosedBackCover
        journal={
          activeJournal
        }
      />

    ),

  });


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      className="journal-page"
      onClick={() => {

        if (showCoverMenu) {

          setShowCoverMenu(
            false
          );

        }

      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

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


      {/* =====================================================
          DELETE
      ===================================================== */}

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


      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="book-controls">

        <button
          disabled={
            currentLocation <= 1 ||
            isTurning
          }
          onClick={
            goPreviousPage
          }
        >

          ← PREVIOUS

        </button>


        <span>

          {isClosedFront &&
            'Closed'}


          {currentLocation === 2 &&
            'Table of Contents'}


          {currentLocation >= 3 &&
            currentLocation <
              maxLocation - 1 &&
            `Page ${
              currentLocation - 2
            } of ${
              poems?.length ?? 0
            }`}


          {currentLocation ===
            maxLocation - 1 &&
            'Inside Back Cover'}


          {isClosedBack &&
            'Back Cover'}

        </span>


        <button
          disabled={
            currentLocation >=
              maxLocation ||
            isTurning
          }
          onClick={
            goNextPage
          }
        >

          {isClosedFront
            ? 'OPEN →'
            : 'NEXT →'}

        </button>

      </div>


      {/* =====================================================
          BOOK
      ===================================================== */}

      <div className="book-stack-wrapper">

        <div
          className={`
            bs-book
            ${
              isClosedFront
                ? 'book-closed-front'
                : ''
            }
            ${
              isClosedBack
                ? 'book-closed-back'
                : ''
            }
            ${
              isOpen
                ? 'book-open'
                : ''
            }
          `}
        >

          {papers.map(
            (
              paper,
              index
            ) => {

              const isFlipped =
                flippedPapers.has(
                  paper.id
                );


              const total =
                papers.length;


              const isTurningThisPaper =
                turningPaperRef.current ===
                paper.id;


              let zIndex;


              if (
                isTurningThisPaper
              ) {

                zIndex =
                  total + 100;

              } else if (
                isFlipped
              ) {

                zIndex =
                  index + 1;

              } else {

                zIndex =
                  total - index;

              }


              return (

                <div
                  key={paper.id}
                  className={`
                    bs-paper
                    ${
                      isFlipped
                        ? 'flipped'
                        : ''
                    }
                  `}
                  style={{
                    zIndex,
                  }}
                >

                  <div className="bs-front">

                    <div className="bs-front-content">

                      {paper.front}

                    </div>

                  </div>


                  <div className="bs-back">

                    <div className="bs-back-content">

                      {paper.back}

                    </div>

                  </div>

                </div>

              );

            }
          )}


          {/* =================================================
              CLICK NAVIGATION

              Only active while book is open.
          ================================================= */}

          {isOpen && !isTurning && (

            <>

              <button
                type="button"
                aria-label="Previous page"
                className="book-click-zone book-click-zone-left"
                onClick={(e) => {

                  e.stopPropagation();

                  goPreviousPage();

                }}
              />


              <button
                type="button"
                aria-label="Next page"
                className="book-click-zone book-click-zone-right"
                onClick={(e) => {

                  e.stopPropagation();

                  goNextPage();

                }}
              />

            </>

          )}

        </div>

      </div>


      {/* =====================================================
          SHARE
      ===================================================== */}

      {showShare && (

        <ShareModal
          journalId={
            journalId
          }
          onClose={() =>
            setShowShare(
              false
            )
          }
        />

      )}


      {/* =====================================================
          EDIT
      ===================================================== */}

      {showEditModal && (

        <EditJournalModal
          journal={
            activeJournal
          }
          onClose={() =>
            setShowEditModal(
              false
            )
          }
          onSaved={(updated) =>
            setJournalOverride(
              updated
            )
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
            (
              poem,
              index
            ) => (

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
          onClick={
            onExit
          }
          className="text-button"
        >

          ← CLOSE JOURNAL

        </button>


        {isOwner && (

          <div className="footer-buttons">

            <Button
              variant="secondary"
              onClick={
                onShare
              }
            >

              Share

            </Button>


            <Button
              onClick={
                onNewPoem
              }
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
}) {

  const navigate =
    useNavigate();


  return (

    <div className="page-inner poem-page">

      <div className="poem-page-heading">

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


      {/* =====================================================
          EDIT ICON
      ===================================================== */}

      {isOwner && (

        <button
          type="button"
          className="poem-edit-icon"
          title="Edit this page"
          aria-label="Edit this page"
          onClick={() =>
            navigate(
              `/journal/${journalId}/poem/${poem.id}`
            )
          }
        >

          ✎

        </button>

      )}


      <div className="poem-text">

        {poem.content}

      </div>

    </div>

  );

}


/* =========================================================
   INSIDE BACK COVER
========================================================= */

function InsideBackCover({
  journal,
}) {

  return (

    <div
      className="inside-back-cover"
      style={{
        backgroundColor:
          journal.cover_color,
      }}
    >

      <div
        className="inside-back-cover-material"
        style={{
          backgroundColor:
            journal.cover_color,
        }}
      />

    </div>

  );

}


/* =========================================================
   CLOSED BACK COVER
========================================================= */

function ClosedBackCover({
  journal,
}) {

  return (

    <div
      className="closed-back-cover"
      style={{
        backgroundColor:
          journal.cover_color,
      }}
    >

      {/* ===================================================
          SPINE

          RIGHT SIDE because the back cover is the reverse
          of the front cover.
      =================================================== */}

      <div
        className="back-cover-spine"
        style={{
          backgroundColor:
            journal.cover_color,
        }}
      >

        <div className="spine-highlight" />

        <div className="spine-lines">

          <span />
          <span />
          <span />
          <span />
          <span />
          <span />

        </div>

      </div>


      {/* ===================================================
          BACK COVER CONTENT
      =================================================== */}

      <div className="closed-back-cover-content">

        <div className="closed-back-cover-title">

          {journal.title}

        </div>

      </div>

    </div>

  );

}