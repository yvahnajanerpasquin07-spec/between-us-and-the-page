import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotebookCover from './NotebookCover';

export default function JournalCard({ journal, readOnly = false }) {
  const navigate = useNavigate();
  const date = new Date(journal.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      layoutId={`journal-cover-${journal.id}`}
      onClick={() => navigate(`/journal/${journal.id}`)}
      className="aspect-[3/4] w-full cursor-pointer transition-transform duration-150 hover:-translate-y-1"
      whileTap={{ scale: 0.97 }}
    >
      <NotebookCover
        title={journal.title}
        description={journal.description}
        date={date}
        coverColor={journal.cover_color}
        coverMaterial={journal.cover_material}
        coverImageUrl={journal.cover_image_url}
        readOnly={readOnly}
      />
    </motion.div>
  );
}