import { useState } from 'react';
import { updateJournal } from '../services/journalService';
import Button from './Button';
import Input from './Input';

export default function EditJournalModal({ journal, onClose, onSaved }) {
  const [title, setTitle] = useState(journal.title ?? '');
  const [description, setDescription] = useState(journal.description ?? '');
  const [authorName, setAuthorName] = useState(journal.author_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateJournal(journal.id, {
        title,
        description: description || null,
        author_name: authorName || null,
      });
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-paper p-6 shadow-xl"
      >
        <h2 className="font-display text-xl">Edit journal</h2>

        <Input
          id="edit-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          id="edit-description"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          id="edit-author"
          label="By (optional)"
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}