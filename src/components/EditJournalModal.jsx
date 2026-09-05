import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  updateJournal,
  uploadJournalCover,
} from '../services/journalService';

import Button from './Button';
import Input from './Input';
import CoverImageEditor, {
  createCoverImages,
} from './CoverImageEditor';

import { materialOptions } from './NotebookCover';


const DEFAULT_COVER_SETTINGS = {
  x: 0,
  y: 0,
  zoom: 1,
};


export default function EditJournalModal({
  journal,
  onClose,
  onSaved,
}) {

  const [
    title,
    setTitle,
  ] = useState(
    journal.title ?? ''
  );


  const [
    description,
    setDescription,
  ] = useState(
    journal.description ?? ''
  );


  const [
    authorName,
    setAuthorName,
  ] = useState(
    journal.author_name ?? ''
  );


  const [
    journalDate,
    setJournalDate,
  ] = useState(
    journal.journal_date ?? ''
  );


  const [
    frontImageUrl,
    setFrontImageUrl,
  ] = useState(
    journal.cover_image_url ?? ''
  );


  const [
    backImageUrl,
    setBackImageUrl,
  ] = useState(
    journal.cover_back_image_url ?? ''
  );


  const [
    frontImageFile,
    setFrontImageFile,
  ] = useState(null);


  const [
    backImageFile,
    setBackImageFile,
  ] = useState(null);


  const [
    frontSettings,
    setFrontSettings,
  ] = useState(
    DEFAULT_COVER_SETTINGS
  );


  const [
    backSettings,
    setBackSettings,
  ] = useState(
    DEFAULT_COVER_SETTINGS
  );


  const [
    coverMaterial,
    setCoverMaterial,
  ] = useState(
    journal.cover_material ??
      'kraft'
  );


  const [
    coverColor,
    setCoverColor,
  ] = useState(
    journal.cover_color ??
      '#c9a876'
  );


  const [
    spineColor,
    setSpineColor,
  ] = useState(
    journal.spine_color ??
      '#8a6f47'
  );


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const frontObjectUrlRef =
    useRef(null);


  const backObjectUrlRef =
    useRef(null);


  /* =======================================================
     CLEAN UP PREVIEW URLS
  ======================================================= */

  useEffect(() => {

    return () => {

      if (
        frontObjectUrlRef.current
      ) {

        URL.revokeObjectURL(
          frontObjectUrlRef.current
        );

      }


      if (
        backObjectUrlRef.current
      ) {

        URL.revokeObjectURL(
          backObjectUrlRef.current
        );

      }

    };

  }, []);


  /* =======================================================
     SELECT FRONT COVER
  ======================================================= */

  function handleFrontImageChange(e) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      setError(
        'Please select an image file.'
      );

      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        'Image must be smaller than 10 MB.'
      );

      return;

    }


    setError('');


    if (
      frontObjectUrlRef.current
    ) {

      URL.revokeObjectURL(
        frontObjectUrlRef.current
      );

    }


    const previewUrl =
      URL.createObjectURL(
        file
      );


    frontObjectUrlRef.current =
      previewUrl;


    setFrontImageFile(
      file
    );

    setFrontImageUrl(
      previewUrl
    );


    setFrontSettings(
      DEFAULT_COVER_SETTINGS
    );

  }


  /* =======================================================
     SELECT BACK COVER
  ======================================================= */

  function handleBackImageChange(e) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      setError(
        'Please select an image file.'
      );

      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        'Image must be smaller than 10 MB.'
      );

      return;

    }


    setError('');


    if (
      backObjectUrlRef.current
    ) {

      URL.revokeObjectURL(
        backObjectUrlRef.current
      );

    }


    const previewUrl =
      URL.createObjectURL(
        file
      );


    backObjectUrlRef.current =
      previewUrl;


    setBackImageFile(
      file
    );

    setBackImageUrl(
      previewUrl
    );


    setBackSettings(
      DEFAULT_COVER_SETTINGS
    );

  }


  /* =======================================================
     SAVE JOURNAL
  ======================================================= */

  async function handleSave(e) {

    e.preventDefault();

    setSaving(true);

    setError('');


    try {

      let finalFrontImageUrl =
        journal.cover_image_url ??
        null;


      let finalBackImageUrl =
        journal.cover_back_image_url ??
        null;


      /*
        Only crop/upload a side if the user
        selected a new image for that side.
      */

      if (frontImageFile) {

        setUploading(true);


        const {
          front,
        } =
          await createCoverImages(
            'front'
          );


        if (!front) {

          throw new Error(
            'Could not prepare the front cover image.'
          );

        }


        const frontFile =
          new File(
            [
              front,
            ],
            frontImageFile.name ||
              'front-cover.jpg',
            {
              type:
                'image/jpeg',
            }
          );


        finalFrontImageUrl =
          await uploadJournalCover(
            journal.id,
            frontFile,
            'front'
          );

      }


      if (backImageFile) {

        setUploading(true);


        const {
          back,
        } =
          await createCoverImages(
            'back'
          );


        if (!back) {

          throw new Error(
            'Could not prepare the back cover image.'
          );

        }


        const backFile =
          new File(
            [
              back,
            ],
            backImageFile.name ||
              'back-cover.jpg',
            {
              type:
                'image/jpeg',
            }
          );


        finalBackImageUrl =
          await uploadJournalCover(
            journal.id,
            backFile,
            'back'
          );

      }


      setUploading(false);


      const updated =
        await updateJournal(
          journal.id,
          {

            title:
              title.trim() ||
              null,

            description:
              description.trim() ||
              null,

            author_name:
              authorName.trim() ||
              null,

            journal_date:
              journalDate ||
              null,

            cover_image_url:
              finalFrontImageUrl,

            cover_back_image_url:
              finalBackImageUrl,

            cover_color:
              coverColor,

            cover_material:
              coverMaterial,

            spine_color:
              spineColor,

          }
        );


      onSaved(updated);

      onClose();

    } catch (err) {

      console.error(
        'Failed to save journal:',
        err
      );


      setUploading(false);


      setError(
        err?.message ||
          'Something went wrong while saving the journal.'
      );

    } finally {

      setSaving(false);

    }

  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[3000]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
      onClick={onClose}
    >

      <form

        onSubmit={
          handleSave
        }

        onClick={(e) =>
          e.stopPropagation()
        }

        className="
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          gap-4
          overflow-y-auto
          rounded-md
          bg-paper
          p-6
          shadow-xl
        "

      >

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            font-display
            text-xl
          "
        >
          Edit journal
        </h2>


        <Input

          id="edit-title"

          label="Title (optional)"

          value={
            title
          }

          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }

        />


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Input

          id="edit-description"

          label="Description (optional)"

          value={
            description
          }

          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }

        />


        {/* =================================================
            AUTHOR
        ================================================= */}

        <Input

          id="edit-author"

          label="By / Author (optional)"

          value={
            authorName
          }

          onChange={(e) =>
            setAuthorName(
              e.target.value
            )
          }

        />


        {/* =================================================
            DATE
        ================================================= */}

        <Input

          id="edit-date"

          label="Date (optional)"

          type="date"

          value={
            journalDate
          }

          onChange={(e) =>
            setJournalDate(
              e.target.value
            )
          }

        />


        {/* =================================================
            FRONT COVER IMAGE
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <label
            htmlFor="edit-front-cover"
            className="
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Front cover image
          </label>


          <input
            id="edit-front-cover"
            type="file"
            accept="image/*"
            onChange={
              handleFrontImageChange
            }
            className="
              input-field
            "
          />

        </div>


        {/* =================================================
            BACK COVER IMAGE
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <label
            htmlFor="edit-back-cover"
            className="
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Back cover image
          </label>


          <input
            id="edit-back-cover"
            type="file"
            accept="image/*"
            onChange={
              handleBackImageChange
            }
            className="
              input-field
            "
          />

        </div>


        {/* =================================================
            COVER IMAGE EDITOR
        ================================================= */}

        {(
          frontImageUrl ||
          backImageUrl
        ) && (

          <CoverImageEditor

            frontImageUrl={
              frontImageUrl
            }

            backImageUrl={
              backImageUrl
            }

            frontSettings={
              frontSettings
            }

            backSettings={
              backSettings
            }

            onFrontChange={
              setFrontSettings
            }

            onBackChange={
              setBackSettings
            }

          />

        )}


        {/* =================================================
            COVER MATERIAL
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <label
            className="
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Cover material
          </label>


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {materialOptions.map(
              (material) => (

                <button

                  key={
                    material.value
                  }

                  type="button"

                  onClick={() =>
                    setCoverMaterial(
                      material.value
                    )
                  }

                  className={`
                    rounded-md
                    border
                    px-3
                    py-1.5
                    font-body
                    text-sm
                    ${
                      coverMaterial ===
                      material.value
                        ? 'border-margin bg-margin/10 text-margin'
                        : 'border-ink/15 hover:border-margin/50'
                    }
                  `}

                >

                  {
                    material.label
                  }

                </button>

              )
            )}

          </div>

        </div>


        {/* =================================================
            COVER COLOR
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <label
            htmlFor="edit-cover-color"
            className="
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Cover color
          </label>


          <input

            id="edit-cover-color"

            type="color"

            value={
              coverColor
            }

            onChange={(e) =>
              setCoverColor(
                e.target.value
              )
            }

            className="
              h-10
              w-16
              cursor-pointer
              rounded-md
              border
              border-ink/15
              bg-transparent
            "

          />

        </div>


        {/* =================================================
            SPINE COLOR
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <label
            htmlFor="edit-spine-color"
            className="
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            Spine color
          </label>


          <input
            id="edit-spine-color"
            type="color"
            value={spineColor}
            onChange={(e) =>
              setSpineColor(
                e.target.value
              )
            }
            className="
              h-10
              w-16
              cursor-pointer
              rounded-md
              border
              border-ink/15
              bg-transparent
            "
          />

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="
              rounded-md
              border
              border-margin/30
              bg-margin/10
              p-3
              text-sm
              text-margin
            "
          >

            {error}

          </div>

        )}


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div
          className="
            mt-2
            flex
            justify-end
            gap-2
          "
        >

          <Button

            type="button"

            variant="secondary"

            onClick={
              onClose
            }

            disabled={
              saving
            }

          >
            Cancel
          </Button>


          <Button

            type="submit"

            disabled={
              saving
            }

          >

            {uploading
              ? 'Uploading…'
              : saving
                ? 'Saving…'
                : 'Save changes'}

          </Button>

        </div>

      </form>

    </div>

  );

}
