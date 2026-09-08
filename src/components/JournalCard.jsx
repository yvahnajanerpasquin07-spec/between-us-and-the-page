import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotebookCover from './NotebookCover';


export default function JournalCard({
  journal,
  readOnly = false,
  compactMobile = false,

  /*
    OPTION A:
    Sample journals use their public share token
    so clicking them opens the view-only journal.
  */

  publicShareToken = null,

  /*
    Used when the card is inside the user's
    "Shared with you" list.

    This removes only the current user's access.
    It does NOT delete the owner's journal.
  */

  onRemoveShared = null,
}) {

  const navigate =
    useNavigate();


  const date =
    journal.journal_date
      ? new Date(
          `${journal.journal_date}T00:00:00`
        ).toLocaleDateString(
          undefined,
          {
            year:
              'numeric',

            month:
              'short',

            day:
              'numeric',
          }
        )
      : '';


  return (

    <motion.div

      layout

      onClick={() =>
        navigate(
          publicShareToken
            ? `/shared/${publicShareToken}/book`
            : `/journal/${journal.id}`
        )
      }

      className="
        relative
        aspect-[3/4]
        w-full
        cursor-pointer
        transition-transform
        duration-150
        hover:-translate-y-1
      "

      whileTap={{
        scale: 0.97,
      }}

      transition={{
        layout: {
          duration: 0.42,
          ease: [
            0.22,
            0.61,
            0.36,
            1,
          ],
        },
      }}

    >

      <NotebookCover

        title={
          journal.title
        }

        description={
          journal.description
        }

        date={
          date
        }

        authorName={
          journal.author_name
        }

        coverColor={
          journal.cover_color
        }

        coverMaterial={
          journal.cover_material
        }

        spineColor={
          journal.spine_color
        }

        coverImageUrl={
          journal.cover_image_url
        }

        readOnly={
          readOnly
        }

        compactMobile={
          compactMobile
        }

      />


      {/* =====================================================
          REMOVE FROM SHARED WITH YOU
          -----------------------------------------------------
          This button ONLY removes the current user's access.
          It does NOT delete the owner's journal.
      ===================================================== */}

      {onRemoveShared &&
        journal.access_id && (

        <button
          type="button"

          onClick={(e) => {

            /*
              Prevent the click from opening the journal.
            */

            e.stopPropagation();


            onRemoveShared(
              journal.access_id
            );

          }}

          className="
            absolute
            right-2
            top-2
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-ink/15
            bg-paper/90
            text-ink-soft
            shadow-sm
            transition
            hover:border-ink/30
            hover:bg-paper
            hover:text-ink
          "

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