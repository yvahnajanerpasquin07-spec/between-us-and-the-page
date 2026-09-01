import { useRef, useState } from 'react';
import {
  updateJournal,
  uploadJournalCover,
} from '../services/journalService';

import Button from './Button';
import Input from './Input';

export default function EditJournalModal({
  journal,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState(
    journal.title ?? ''
  );

  const [description, setDescription] = useState(
    journal.description ?? ''
  );

  const [authorName, setAuthorName] = useState(
    journal.author_name ?? ''
  );

  const [coverImageUrl, setCoverImageUrl] = useState(
    journal.cover_image_url ?? ''
  );

  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);


  // =========================================================
  // SELECT COVER IMAGE
  // =========================================================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // 10 MB maximum
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setCoverImageUrl(previewUrl);
  }


  // =========================================================
  // SAVE JOURNAL
  // =========================================================

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      let finalCoverImageUrl =
        journal.cover_image_url ?? null;


      // -----------------------------------------------------
      // UPLOAD NEW COVER IMAGE
      // -----------------------------------------------------

      if (selectedFile) {
        setUploading(true);

        finalCoverImageUrl =
          await uploadJournalCover(
            journal.id,
            selectedFile
          );

        setUploading(false);
      }


      // -----------------------------------------------------
      // UPDATE JOURNAL DATABASE RECORD
      // -----------------------------------------------------

      const updated = await updateJournal(
        journal.id,
        {
          title,
          description: description || null,
          author_name: authorName || null,
          cover_image_url:
            finalCoverImageUrl || null,
        }
      );


      // Send updated journal back to parent
      onSaved(updated);

      onClose();

    } catch (err) {
      console.error(err);

      setUploading(false);

      setError(
        err?.message ||
        'Something went wrong while saving the journal.'
      );

    } finally {
      setSaving(false);
    }
  }


  // =========================================================
  // REMOVE COVER IMAGE
  // =========================================================

  function handleRemoveImage() {
    setSelectedFile(null);
    setCoverImageUrl('');
  }


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md max-h-[90vh] overflow-y-auto flex-col gap-4 rounded-md bg-paper p-6 shadow-xl"
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <h2 className="font-display text-xl">
          Edit journal
        </h2>


        <Input
          id="edit-title"
          label="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Input
          id="edit-description"
          label="Description (optional)"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />


        {/* =================================================
            AUTHOR
        ================================================= */}

        <Input
          id="edit-author"
          label="By (optional)"
          placeholder="Your name"
          value={authorName}
          onChange={(e) =>
            setAuthorName(e.target.value)
          }
        />


        {/* =================================================
            COVER IMAGE
        ================================================= */}

        <div className="flex flex-col gap-2">

          <label
            htmlFor="cover-image"
            className="font-mono text-xs uppercase tracking-wide text-ink-soft"
          >
            Cover image
          </label>


          {/* IMAGE PREVIEW */}

          {coverImageUrl ? (
            <div className="relative overflow-hidden rounded-md border border-ink/10">

              <img
                src={coverImageUrl}
                alt="Journal cover preview"
                className="h-48 w-full object-cover"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 rounded-md bg-black/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-white hover:bg-black/80"
              >
                Remove
              </button>

            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-ink/20 text-sm text-ink-soft">
              No cover image
            </div>
          )}


          {/* HIDDEN FILE INPUT */}

          <input
            ref={fileInputRef}
            id="cover-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />


          {/* CHOOSE IMAGE BUTTON */}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            {selectedFile
              ? 'Choose another image'
              : 'Upload cover image'}
          </Button>


          <p className="text-xs text-ink-soft">
            JPG, PNG, GIF, WEBP, or another supported image.
            Maximum 10 MB.
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-md border border-margin/30 bg-margin/10 p-3 text-sm text-margin">
            {error}
          </div>
        )}


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-2 flex justify-end gap-2">

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>


          <Button
            type="submit"
            disabled={saving}
          >
            {uploading
              ? 'Uploading…'
              : saving
              ? 'Saving…'
              : 'Save'}
          </Button>

        </div>

      </form>
    </div>
  );
}