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
      = INSIDE BACK COVER

    poems.length + 4
      = CLOSED BACK COVER
  */

  const [currentLocation, setCurrentLocation] =
    useState(1);


  /*
    Stores papers that have already
    flipped from right → left.
  */

  const [flippedPapers, setFlippedPapers] =
    useState(() => new Set());


  /*
    Prevent multiple page turns
    from happening at once.
  */

  const [isTurning, setIsTurning] =
    useState(false);


  const turningPaperRef =
    useRef(null);


  const locationRef =
    useRef(1);


  /* =========================================================
     MODALS
  ========================================================= */

  const [showShare, setShowShare] =
    useState(false);

  const [showCoverMenu, setShowCoverMenu] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [journalOverride, setJournalOverride] =
    useState(null);


  /* =========================================================
     IMAGE WIDGET STATE
  =========================================================

     We keep a local copy for immediate UI updates.

     The actual image widget is ALSO saved to Supabase
     through updatePoemImageBox().
  ========================================================= */

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


  /*
    Keep location ref synchronized.
  */

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


  /* =========================================================
     INSIDE FRONT COVER
  ========================================================= */

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

    try {

      const poem =
        await createPoem({

          journalId,

          title:
            'Untitled',

          content:
            '',

          displayOrder:
            poems?.length ?? 0,

        });


      navigate(
        `/journal/${journalId}/poem/${poem.id}`
      );

    } catch (error) {

      console.error(
        'Failed to create poem:',
        error
      );

      alert(
        'Could not create the poem.'
      );

    }

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


    try {

      await deleteJournal(
        journalId
      );

      navigate(
        '/dashboard'
      );

    } catch (error) {

      console.error(
        'Failed to delete journal:',
        error
      );

      alert(
        'Could not delete the journal.'
      );

    }

  }


  /* =========================================================
     SAVE IMAGE WIDGET
  ========================================================= */

  function saveImageWidget(
    poemId,
    next
  ) {

    /*
      Update local React state immediately.
    */

    setImageWidgets(
      (prev) => {

        const nextMap = {
          ...prev,
          [poemId]: next,
        };


        /*
          Keep localStorage as a local cache.
        */

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


    /*
      Save the widget position and image URL
      to Supabase when the user owns the journal.
    */

    if (isOwner) {

      updatePoemImageBox(
        poemId,
        next
      ).catch((error) => {

        console.error(
          'Failed to save image position:',
          error
        );

      });

    }

  }


  /* =========================================================
     UPLOAD IMAGE FOR POEM
  ========================================================= */

  async function addImageForPoem(
    poemId,
    file
  ) {

    if (!file) {
      return;
    }


    try {

      /*
        Upload the actual image file
        to the Supabase Storage bucket.
      */

      const url =
        await uploadPoemImage(
          journalId,
          poemId,
          file
        );


      /*
        Default position for the image.

        The image is placed near the TOP
        of the left page.
      */

      const defaultBox = {

        x: 20,

        y: 20,

        w: 220,

        h: 140,

        url,

      };


      /*
        Save the image widget immediately.
      */

      saveImageWidget(
        poemId,
        defaultBox
      );


      /*
        Also make sure the image widget
        is stored in Supabase.
      */

      if (isOwner) {

        await updatePoemImageBox(
          poemId,
          defaultBox
        );

      }

    } catch (error) {

      console.error(
        'Upload failed:',
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

    setIsTurning(
      false
    );

  }


  /* =========================================================
     TURN FORWARD
  ========================================================= */

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


    setIsTurning(
      true
    );


    setFlippedPapers(
      (prev) => {

        const next =
          new Set(prev);

        next.add(
          paperId
        );

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


  /* =========================================================
     TURN BACKWARD
  ========================================================= */

  function turnBackwardOne() {

    if (isTurning) {
      return;
    }


    const location =
      locationRef.current;


    if (
      location <= 1
    ) {

      return;

    }


    const paperId =
      location - 1;


    turningPaperRef.current =
      paperId;


    setIsTurning(
      true
    );


    setFlippedPapers(
      (prev) => {

        const next =
          new Set(prev);

        next.delete(
          paperId
        );

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
     GO TO POEM FROM TABLE OF CONTENTS
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


        setIsTurning(
          true
        );


        setFlippedPapers(
          (prev) => {

            const next =
              new Set(prev);

            next.add(
              paperId
            );

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


            setIsTurning(
              false
            );


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
  =========================================================

     IMPORTANT:

     The old version used:

       IMAGE ? image : SPOTIFY

     which meant only ONE widget could appear.

     This version renders BOTH independently.
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


    /*
      Get the image widget.

      First try local state.

      If it isn't there, use the value
      stored in the poem from Supabase.
    */

    const imageWidget =
      imageWidgets[poem.id] ??
      poem.image_widget_box ??
      null;


    /*
      Determine whether an image exists.
    */

    const hasImage =
      Boolean(
        imageWidget?.url
      );


    /*
      Determine whether Spotify exists.
    */

    const hasSpotify =
      Boolean(
        poem.spotify_url
      );


    return (

      <div className="book-left-page">

        <div
          className="page-back"
          ref={leftPageRef}
        >

          <div
            className="page-back-inner"
            style={{
              position: 'relative',
            }}
          >

            {/* =================================================
                IMAGE WIDGET
            ================================================= */}

            {hasImage && (

              <DraggableWidget
                key={`${poem.id}-image`}
                containerRef={
                  leftPageRef
                }
                editable={
                  isOwner
                }
                initial={
                  imageWidget
                }
                onSave={(box) => {

                  saveImageWidget(
                    poem.id,
                    {
                      ...box,
                      url:
                        imageWidget.url,
                    }
                  );

                }}
              >

                <img
                  src={
                    imageWidget.url
                  }
                  alt="Poem page"
                  draggable="false"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

              </DraggableWidget>

            )}


            {/* =================================================
                SPOTIFY WIDGET
            ================================================= */}

            {hasSpotify && (

              <DraggableWidget
                key={`${poem.id}-spotify`}
                containerRef={
                  leftPageRef
                }
                editable={
                  isOwner
                }

                /*
                  If Spotify already has a saved
                  position, use it.

                  Otherwise place it BELOW the image
                  so the two widgets don't overlap.
                */

                initial={
                  poem.spotify_widget_box ??
                  {
                    x: 20,
                    y: hasImage
                      ? 300
                      : 20,
                    w: 320,
                    h: 150,
                  }
                }

                onSave={(box) => {

                  updatePoemWidgetBox(
                    poem.id,
                    box
                  ).catch(
                    (error) => {

                      console.error(
                        'Failed to save Spotify position:',
                        error
                      );

                    }
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

            )}


            {/* =================================================
                EMPTY MEDIA PAGE
            ================================================= */}

            {!hasImage &&
              !hasSpotify && (

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

     FRONT = FRONT COVER
     BACK  = INSIDE FRONT COVER
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

     FRONT = TABLE OF CONTENTS
     BACK  = POEM 1 MEDIA
  ========================================================= */

  papers.push({

    id: 2,

    front: (

      <div className="book-right-page">

        <TocPage
          journal={
            activeJournal
          }
          poems={
            poems
          }
          poemsLoading={
            poemsLoading
          }
          isOwner={
            isOwner
          }
          onSelectPoem={
            goToPoem
          }
          onShare={() =>
            setShowShare(
              true
            )
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
    (
      poem,
      index
    ) => {

      const nextPoem =
        poems[index + 1];


      papers.push({

        id:
          index + 3,


        front: (

          <div className="book-right-page">

            <PoemPage
              poem={
                poem
              }
              journalId={
                journalId
              }
              isOwner={
                isOwner
              }
              pageNumber={
                index + 1
              }
              totalPages={
                poems.length
              }
              onAddImage={
                (file) =>
                  addImageForPoem(
                    poem.id,
                    file
                  )
              }
            />

          </div>

        ),


        back:
          nextPoem
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

     FRONT = INSIDE BACK COVER
     BACK  = CLOSED BACK COVER
  ========================================================= */

  const finalPaperId =
    papers.length + 1;


  papers.push({

    id:
      finalPaperId,


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
     BOOK AREA CLICK HANDLER
  ========================================================= */

  function handleBookAreaClick(e) {

    if (
      !isOpen ||
      isTurning
    ) {

      return;

    }


    /*
      Don't turn pages when clicking
      interactive elements.
    */

    const interactiveElement =
      e.target.closest(
        'button, a, input, textarea, select, [role="button"], iframe'
      );


    if (interactiveElement) {

      return;

    }


    const rect =
      e.currentTarget.getBoundingClientRect();


    const x =
      e.clientX -
      rect.left;


    /*
      LEFT = previous
      RIGHT = next
    */

    if (
      x <= 65
    ) {

      goPreviousPage();

      return;

    }


    if (
      x >=
      rect.width - 65
    ) {

      goNextPage();

    }

  }


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
          DELETE JOURNAL
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

      <div
        className="book-stack-wrapper"
        onClick={
          handleBookAreaClick
        }
      >

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
                  key={
                    paper.id
                  }
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

                  {/* =========================================
                      FRONT FACE
                  ========================================= */}

                  <div className="bs-front">

                    <div className="bs-front-content">

                      {paper.front}

                    </div>

                  </div>


                  {/* =========================================
                      BACK FACE
                  ========================================= */}

                  <div className="bs-back">

                    <div className="bs-back-content">

                      {paper.back}

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>


        {/* ===================================================
            PAGE TURN ZONES

            pointerEvents = none

            This allows buttons and widgets underneath
            to receive clicks.
        =================================================== */}

        {isOpen && (

          <>

            <div
              className="page-turn-zone page-turn-zone-left"
              aria-hidden="true"
              style={{
                pointerEvents:
                  'none',
              }}
            />


            <div
              className="page-turn-zone page-turn-zone-right"
              aria-hidden="true"
              style={{
                pointerEvents:
                  'none',
              }}
            />

          </>

        )}

      </div>


      {/* =====================================================
          SHARE MODAL
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
          EDIT JOURNAL MODAL
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
  onShare,
  onNewPoem,
}) {

  return (

    <div className="page-inner">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="toc-header">

        <div>

          <h2>
            {journal.title}
          </h2>


          <p className="page-label">

            TABLE OF CONTENTS

          </p>

        </div>


        {isOwner && (

          <div className="toc-actions">

            {/* SHARE */}

            <button
              type="button"
              className="toc-icon-button"
              onClick={
                onShare
              }
              aria-label="Share journal"
              title="Share journal"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <circle
                  cx="18"
                  cy="5"
                  r="2"
                />

                <circle
                  cx="6"
                  cy="12"
                  r="2"
                />

                <circle
                  cx="18"
                  cy="19"
                  r="2"
                />

                <line
                  x1="8"
                  y1="11"
                  x2="16"
                  y2="6"
                />

                <line
                  x1="8"
                  y1="13"
                  x2="16"
                  y2="18"
                />

              </svg>

            </button>


            {/* NEW POEM */}

            <button
              type="button"
              className="toc-icon-button toc-plus-button"
              onClick={
                onNewPoem
              }
              aria-label="New poem"
              title="New poem"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <line
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                />

                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />

              </svg>

            </button>

          </div>

        )}

      </div>


      {/* ===================================================
          POEM LIST
      =================================================== */}

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
                key={
                  poem.id
                }
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
          onClick={(e) => {

            /*
              Stop this click from reaching
              the book page handler.
            */

            e.stopPropagation();


            navigate(
              `/journal/${journalId}/poem/${poem.id}`
            );

          }}
          className="edit-button"
          aria-label="Edit this page"
          title="Edit this page"
        >

          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >

            <path
              d="
                M12 20h9
                M16.5 3.5
                a2.121 2.121 0 0 1 3 3
                L8 18
                l-4 1
                1-4Z
              "
            />

          </svg>

        </button>

      )}

    </div>

  );

}


/* =========================================================
   INSIDE BACK COVER
========================================================= */

function InsideBackCover({
  journal,
}) {

  const material =
    journal.cover_material ||
    'kraft';


  const materialTextures = {

    kraft:
      'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 3px)',

    velvet:
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)',

    leather:
      'repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 6px)',

  };


  return (

    <div
      className="inside-back-cover"
      style={{
        backgroundColor:
          journal.cover_color,

        backgroundImage:
          materialTextures[
            material
          ] ||
          materialTextures.kraft,
      }}
    />

  );

}


/* =========================================================
   CLOSED BACK COVER
========================================================= */

function ClosedBackCover({
  journal,
}) {

  const material =
    journal.cover_material ||
    'kraft';


  const spineColors = {

    kraft:
      '#8a6f47',

    velvet:
      '#4d1119',

    leather:
      '#221812',

  };


  const spineColor =
    spineColors[
      material
    ] ||
    spineColors.kraft;


  const textures = {

    kraft:
      'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 3px)',

    velvet:
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)',

    leather:
      'repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 6px)',

  };


  return (

    <div
      className="closed-back-cover"
      style={{
        backgroundColor:
          journal.cover_color,

        backgroundImage:
          textures[
            material
          ] ||
          textures.kraft,

        boxShadow:
          '0 8px 18px rgba(0,0,0,0.20)',
      }}
    >

      {/* ===================================================
          BACK COVER CONTENT
      =================================================== */}

      <div className="closed-back-cover-content">

        <div className="closed-back-cover-title">

          {journal.title}

        </div>

      </div>


      {/* ===================================================
          BACK COVER SPINE
      =================================================== */}

      <div
        className="back-cover-spine"
        style={{
          background:
            `linear-gradient(
              to left,
              ${spineColor},
              ${spineColor}dd 70%,
              transparent
            )`,
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

    </div>

  );

}
