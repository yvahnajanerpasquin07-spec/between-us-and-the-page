import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotebookCover from './NotebookCover';

export default function JournalCard({
  journal,
  readOnly = false,
  compactMobile = false,
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
          `/journal/${journal.id}`
        )
      }

      className="
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

    </motion.div>

  );

}