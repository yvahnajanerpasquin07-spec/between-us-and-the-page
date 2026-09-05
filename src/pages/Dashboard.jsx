import { useEffect, useRef, useState } from 'react';
import {
  createJournal,
  getMyJournals,
  getSharedJournals,
  uploadJournalCover,
  updateJournalCoverImages,
} from '../services/journalService';
import { useAsync } from '../hooks/useAsync';
import { materialOptions } from '../components/NotebookCover';
import JournalCard from '../components/JournalCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import CoverImageEditor, {
  createCoverImages,
} from '../components/CoverImageEditor';


const DEFAULT_COVER_SETTINGS = {
  x: 0,
  y: 0,
  zoom: 1,
};


export default function Dashboard() {

  const {
    data: journals,
    loading,
    refetch,
  } = useAsync(getMyJournals);


  const {
    data: sharedJournals,
    loading: sharedLoading,
  } = useAsync(getSharedJournals);


  const [
    showForm,
    setShowForm,
  ] = useState(false);


  const [
    title,
    setTitle,
  ] = useState('');


  const [
    description,
    setDescription,
  ] = useState('');


  const [
    authorName,
    setAuthorName,
  ] = useState('');


  const [
    journalDate,
    setJournalDate,
  ] = useState('');


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    frontImageUrl,
    setFrontImageUrl,
  ] = useState('');


  const [
    backImageUrl,
    setBackImageUrl,
  ] = useState('');


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
  ] = useState('kraft');


  const [
    coverColor,
    setCoverColor,
  ] = useState('#c9a876');


  const [
    spineColor,
    setSpineColor,
  ] = useState('#8a6f47');


  /*
    Keep the current preview URLs in refs so we only revoke
    the old object URL that is actually being replaced.

    This is important because revoking both URLs whenever
    either image changes can make the other cover preview
    disappear or show a broken image.
  */

  const frontImageUrlRef =
    useRef('');

  const backImageUrlRef =
    useRef('');


  useEffect(() => {

    return () => {

      if (frontImageUrlRef.current) {

        URL.revokeObjectURL(
          frontImageUrlRef.current
        );

      }


      if (backImageUrlRef.current) {

        URL.revokeObjectURL(
          backImageUrlRef.current
        );

      }

    };

  }, []);


  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {

    if (frontImageUrlRef.current) {

      URL.revokeObjectURL(
        frontImageUrlRef.current
      );

      frontImageUrlRef.current = '';

    }


    if (backImageUrlRef.current) {

      URL.revokeObjectURL(
        backImageUrlRef.current
      );

      backImageUrlRef.current = '';

    }


    setTitle('');
    setDescription('');
    setAuthorName('');
    setJournalDate('');

    setFrontImageUrl('');
    setBackImageUrl('');

    setFrontImageFile(null);
    setBackImageFile(null);

    setFrontSettings(
      DEFAULT_COVER_SETTINGS
    );

    setBackSettings(
      DEFAULT_COVER_SETTINGS
    );

    setCoverMaterial('kraft');
    setCoverColor('#c9a876');

  }


  /* =======================================================
     FRONT IMAGE
  ======================================================= */

  function handleFrontImageChange(e) {

    const file =
      e.target.files?.[0] ||
      null;


    if (!file) {
      return;
    }


    if (frontImageUrlRef.current) {

      URL.revokeObjectURL(
        frontImageUrlRef.current
      );

    }


    const url =
      URL.createObjectURL(file);


    frontImageUrlRef.current =
      url;


    setFrontImageFile(file);
    setFrontImageUrl(url);


    setFrontSettings(
      DEFAULT_COVER_SETTINGS
    );

  }


  /* =======================================================
     BACK IMAGE
  ======================================================= */

  function handleBackImageChange(e) {

    const file =
      e.target.files?.[0] ||
      null;


    if (!file) {
      return;
    }


    if (backImageUrlRef.current) {

      URL.revokeObjectURL(
        backImageUrlRef.current
      );

    }


    const url =
      URL.createObjectURL(file);


    backImageUrlRef.current =
      url;


    setBackImageFile(file);
    setBackImageUrl(url);


    setBackSettings(
      DEFAULT_COVER_SETTINGS
    );

  }


  /* =======================================================
     CREATE JOURNAL
  ======================================================= */

  async function handleCreate(e) {

    e.preventDefault();

    setCreating(true);


    try {

      /*
        First create the journal record.
      */

      const journal =
        await createJournal({

          title,

          description,

          authorName,

          journalDate,

          coverMaterial,

          coverColor,

          spineColor,

        });


      /*
        Get the adjusted front/back images.
      */

      const croppedImages =
        (
          frontImageUrl ||
          backImageUrl
        )
          ? await createCoverImages()
          : {
              front: null,
              back: null,
            };


      let frontUrl = null;
      let backUrl = null;


      /*
        Upload FRONT image.
      */

      if (croppedImages.front) {

        const frontFile =
          new File(
            [
              croppedImages.front,
            ],
            frontImageFile?.name ||
              'front-cover.jpg',
            {
              type:
                'image/jpeg',
            }
          );


        frontUrl =
          await uploadJournalCover(
            journal.id,
            frontFile,
            'front'
          );

      }


      /*
        Upload BACK image.
      */

      if (croppedImages.back) {

        const backFile =
          new File(
            [
              croppedImages.back,
            ],
            backImageFile?.name ||
              'back-cover.jpg',
            {
              type:
                'image/jpeg',
            }
          );


        backUrl =
          await uploadJournalCover(
            journal.id,
            backFile,
            'back'
          );

      }


      /*
        Save the two URLs separately.
      */

      if (
        frontUrl ||
        backUrl
      ) {

        await updateJournalCoverImages(
          journal.id,
          frontUrl,
          backUrl
        );

      }


      resetForm();

      setShowForm(false);

      refetch();

    } catch (error) {

      console.error(error);

      const errorMessage =
        error?.message ||
        error?.details ||
        error?.hint ||
        'Could not create the journal. Please try again.';


      window.alert(
        `Could not create the journal.\n\n${errorMessage}`
      );

    } finally {

      setCreating(false);

    }

  }


  return (

    <div className="mx-auto max-w-5xl px-6 py-12">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="font-display text-3xl">
          My Library
        </h1>


        {/* =================================================
            ORIGINAL NEW JOURNAL BUTTON
            DO NOT CHANGE THIS UI
        ================================================= */}

        <Button
          onClick={() =>
            setShowForm(
              (v) => !v
            )
          }
        >
          {showForm
            ? 'Cancel'
            : 'New journal'}
        </Button>

      </div>


      {showForm && (

        <form
          onSubmit={handleCreate}
          className="
            page-card
            mb-10
            flex
            flex-col
            gap-4
            p-6
          "
        >

          <Input
            id="title"
            label="Title (optional)"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />


          <Input
            id="description"
            label="Description (optional)"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />


          <Input
            id="author-name"
            label="By / Author (optional)"
            value={authorName}
            onChange={(e) =>
              setAuthorName(
                e.target.value
              )
            }
          />


          <Input
            id="journal-date"
            label="Date (optional)"
            type="date"
            value={journalDate}
            onChange={(e) =>
              setJournalDate(
                e.target.value
              )
            }
          />


          {/* =================================================
              FRONT COVER UPLOAD
          ================================================= */}

          <div className="flex flex-col gap-1">

            <label
              htmlFor="front-cover-image"
              className="
                font-mono
                text-xs
                uppercase
                tracking-wide
                text-ink-soft
              "
            >
              Front cover image (optional)
            </label>


            <input
              id="front-cover-image"
              type="file"
              accept="image/*"
              onChange={
                handleFrontImageChange
              }
              className="input-field"
            />

          </div>


          {/* =================================================
              BACK COVER UPLOAD
          ================================================= */}

          <div className="flex flex-col gap-1">

            <label
              htmlFor="back-cover-image"
              className="
                font-mono
                text-xs
                uppercase
                tracking-wide
                text-ink-soft
              "
            >
              Back cover image (optional)
            </label>


            <input
              id="back-cover-image"
              type="file"
              accept="image/*"
              onChange={
                handleBackImageChange
              }
              className="input-field"
            />

          </div>


          {/* =================================================
              COVER EDITOR
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
              gap-1
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
                (m) => (

                  <button
                    type="button"
                    key={m.value}
                    onClick={() =>
                      setCoverMaterial(
                        m.value
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
                        m.value
                          ? 'border-margin bg-margin/10 text-margin'
                          : 'border-ink/15 hover:border-margin/50'
                      }
                    `}
                  >
                    {m.label}
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
              gap-1
            "
          >

            <label
              htmlFor="cover-color"
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
              id="cover-color"
              type="color"
              value={coverColor}
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
              gap-1
            "
          >

            <label
              htmlFor="spine-color"
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
              id="spine-color"
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
              CREATE BUTTON
          ================================================= */}

          <Button
            type="submit"
            disabled={creating}
            className="self-start"
          >
            {creating
              ? 'Creating…'
              : 'Create journal'}
          </Button>

        </form>

      )}


      {/* =====================================================
          YOUR JOURNALS
      ===================================================== */}

      <section className="mb-12">

        <h2
          className="
            mb-4
            font-mono
            text-xs
            uppercase
            tracking-wide
            text-ink-soft
          "
        >
          Your journals
        </h2>


        {loading ? (

          <Loading
            label="Opening your library"
          />

        ) : journals?.length ? (

          <div
            className="
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
              md:grid-cols-3
            "
          >

            {journals.map(
              (j) => (

                <JournalCard
                  key={j.id}
                  journal={j}
                />

              )
            )}

          </div>

        ) : (

          <p
            className="
              font-body
              text-ink-soft
            "
          >
            No journals yet — start your first one above.
          </p>

        )}

      </section>


      {/* =====================================================
          SHARED JOURNALS
      ===================================================== */}

      <section>

        <h2
          className="
            mb-4
            font-mono
            text-xs
            uppercase
            tracking-wide
            text-ink-soft
          "
        >
          Shared with you
        </h2>


        {sharedLoading ? (

          <Loading
            label="Checking shared journals"
          />

        ) : sharedJournals?.length ? (

          <div
            className="
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
              md:grid-cols-3
            "
          >

            {sharedJournals.map(
              (j) => (

                <JournalCard
                  key={j.id}
                  journal={j}
                  readOnly
                />

              )
            )}

          </div>

        ) : (

          <p
            className="
              font-body
              text-ink-soft
            "
          >
            Nothing shared with you yet.
          </p>

        )}

      </section>

    </div>

  );

}