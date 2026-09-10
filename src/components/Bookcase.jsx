import { useNavigate } from 'react-router-dom';

export default function Bookcase({
  bookcase,
  journals,
  onDelete,
}) {
  const navigate = useNavigate();

  const books = (bookcase.journalIds || [])
    .map((id) => journals.find((journal) => journal.id === id))
    .filter(Boolean);

  return (
    <div className="bookcase-card">
      <div className="bookcase-shelf-wrap">
        <button
          type="button"
          className="bookcase-shelf-button"
          onClick={() => navigate(`/bookcase/${bookcase.id}`)}
          aria-label={`Open ${bookcase.name}`}
        >
          <div className="bookcase-shelf">
            <div className="bookcase-spines">
              {books.length ? (
                books.map((journal) => (
                  <span
                    key={journal.id}
                    className="bookcase-spine"
                    style={{
                      '--book-spine-color':
                        journal.spine_color ||
                        journal.cover_color ||
                        '#8a6f47',
                    }}
                    title={journal.title || 'Untitled journal'}
                  >
                    <span>{journal.title || 'Untitled'}</span>
                  </span>
                ))
              ) : (
                <span className="bookcase-empty">Empty bookcase</span>
              )}
            </div>

            <div className="bookcase-shelf-line" />
          </div>
        </button>
      </div>

      <div className="bookcase-name-row">
        <div>
          <h3 className="bookcase-title">{bookcase.name}</h3>
          <p className="bookcase-count">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="bookcase-action"
          aria-label="Delete bookcase"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
