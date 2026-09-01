import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import {
  deletePoem,
  getPoem,
  updatePoem,
  uploadPoemImage,
  updatePoemImage,
} from '../services/poemService';

import {
  getJournal,
} from '../services/journalService';

import {
  useAsync,
} from '../hooks/useAsync';

import {
  useAuth,
} from '../context/AuthContext';

import {
  isValidSpotifyUrl,
} from '../utils/spotify';

import SpotifyPlayer from '../components/SpotifyPlayer';

import Button from '../components/Button';

import Input from '../components/Input';

import Loading from '../components/Loading';


/* =========================================================
   POEM PAGE
========================================================= */

export default function Poem() {

  const {
    journalId,
    poemId,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    user,
  } = useAuth();


  /* =======================================================
     LOAD JOURNAL
  ======================================================= */

  const {
    data: journal,
  } = useAsync(
    () => getJournal(journalId),
    [journalId]
  );


  /* =======================================================
     LOAD POEM
  ======================================================= */

  const {
    data: poem,
    loading,
  } = useAsync(
    () => getPoem(poemId),
    [poemId]
  );


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    title,
    setTitle,
  ] = useState('');


  const [
    content,
    setContent,
  ] = useState('');


  const [
    poemDate,
    setPoemDate,
  ] = useState('');


  const [
    spotifyUrl,
    setSpotifyUrl,
  ] = useState('');


  const [
    imageUrl,
    setImageUrl,
  ] = useState('');


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);


  const [
    spotifyError,
    setSpotifyError,
  ] = useState(null);


  const [
    imageError,
    setImageError,
  ] = useState(null);


  const [
    activePanel,
    setActivePanel,
  ] = useState(null);


  const imageInputRef =
    useRef(null);


  /* =======================================================
     LOAD POEM DATA INTO FORM
  ======================================================= */

  useEffect(() => {

    if (!poem) {
      return;
    }


    setTitle(
      poem.title ?? ''
    );


    setContent(
      poem.content ?? ''
    );


    setPoemDate(
      poem.poem_date ?? ''
    );


    setSpotifyUrl(
      poem.spotify_url ?? ''
    );


    setImageUrl(
      poem.image_url ?? ''
    );

  }, [poem]);


  /* =======================================================
     OWNER CHECK
  ======================================================= */

  const isOwner =
    journal &&
    user &&
    journal.owner_id === user.id;


  /* =======================================================
     SAVE POEM
  ======================================================= */

  async function handleSave() {

    if (
      spotifyUrl &&
      !isValidSpotifyUrl(
        spotifyUrl
      )
    ) {

      setSpotifyError(
        'That doesn’t look like a Spotify track, album, or playlist link.'
      );

      return;

    }


    setSpotifyError(null);

    setSaving(true);


    try {

      await updatePoem(
        poemId,
        {
          title,
          content,
          poem_date:
            poemDate || null,
          spotify_url:
            spotifyUrl || null,
          image_url:
            imageUrl || null,
        }
      );


      /*
        Return to the journal after saving.

        This allows the updated image to be
        visible on the journal page.
      */

      navigate(
        `/journal/${journalId}`
      );

    } catch (error) {

      console.error(
        'Failed to save poem:',
        error
      );

      alert(
        'Failed to save poem.'
      );

    } finally {

      setSaving(false);

    }

  }


  /* =======================================================
     UPLOAD IMAGE
  ======================================================= */

  async function handleImageUpload(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    /*
      Only allow common image types.
    */

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      setImageError(
        'Please select an image file.'
      );

      return;

    }


    /*
      Limit image size to 10 MB.
    */

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setImageError(
        'Image must be smaller than 10 MB.'
      );

      return;

    }


    setImageError(null);

    setUploadingImage(true);


    try {

      /*
        Upload to Supabase Storage.
      */

      const url =
        await uploadPoemImage(
          journalId,
          poemId,
          file
        );


      /*
        Save the URL in the poems table.
      */

      await updatePoemImage(
        poemId,
        url
      );


      /*
        Update the page immediately.
      */

      setImageUrl(url);

    } catch (error) {

      console.error(
        'Image upload failed:',
        error
      );

      setImageError(
        error?.message ||
        'Image upload failed.'
      );

    } finally {

      setUploadingImage(false);


      /*
        Allow selecting the same image
        again if necessary.
      */

      if (imageInputRef.current) {

        imageInputRef.current.value =
          '';

      }

    }

  }


  /* =======================================================
     DELETE POEM
  ======================================================= */

  async function handleDelete() {

    if (
      !confirm(
        'Delete this poem? This cannot be undone.'
      )
    ) {

      return;

    }


    try {

      await deletePoem(
        poemId
      );


      navigate(
        `/journal/${journalId}`
      );

    } catch (error) {

      console.error(
        'Failed to delete poem:',
        error
      );

      alert(
        'Failed to delete poem.'
      );

    }

  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <Loading
        label="Turning to this page"
      />
    );

  }


  if (!poem) {

    return (
      <p className="p-6">
        Poem not found.
      </p>
    );

  }


  /* =======================================================
     EDITOR
  ======================================================= */

  if (isOwner) {

    return (

      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="flex flex-col gap-8 lg:flex-row">

          {/* =================================================
              MAIN EDITOR
          ================================================= */}

          <div className="flex flex-1 flex-col gap-5">

            <Input
              id="poem-title"
              label="Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />


            <Input
              id="poem-date"
              label="Date"
              type="date"
              value={poemDate}
              onChange={(e) =>
                setPoemDate(
                  e.target.value
                )
              }
            />


            {/* =============================================
                POEM CONTENT
            ============================================= */}

            <div className="flex flex-col gap-1">

              <label
                htmlFor="poem-content"
                className="font-mono text-xs uppercase tracking-wide text-ink-soft"
              >
                Poem
              </label>


              <textarea
                id="poem-content"
                rows={14}
                value={content}
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
                className="input-field font-body leading-relaxed"
              />

            </div>


            {/* =============================================
                IMAGE PANEL
            ============================================= */}

            {activePanel === 'image' && (

              <div className="flex flex-col gap-3 rounded-md border border-ink/10 p-4">

                <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                  Picture
                </p>


                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageUpload
                  }
                  className="block w-full text-sm"
                />


                {uploadingImage && (

                  <p className="text-sm text-ink-soft">
                    Uploading image…
                  </p>

                )}


                {imageError && (

                  <p className="text-sm text-margin">
                    {imageError}
                  </p>

                )}


                {imageUrl && (

                  <div className="mt-2 overflow-hidden rounded-md border border-ink/10">

                    <img
                      src={imageUrl}
                      alt="Poem"
                      className="max-h-80 w-full object-contain"
                    />

                  </div>

                )}

              </div>

            )}


            {/* =============================================
                SPOTIFY PANEL
            ============================================= */}

            {activePanel === 'spotify' && (

              <div className="flex flex-col gap-2 rounded-md border border-ink/10 p-4">

                <Input
                  id="spotify-url"
                  label="Spotify link"
                  placeholder="https://open.spotify.com/track/..."
                  value={spotifyUrl}
                  onChange={(e) =>
                    setSpotifyUrl(
                      e.target.value
                    )
                  }
                />


                {spotifyError && (

                  <p className="text-sm text-margin">
                    {spotifyError}
                  </p>

                )}


                {spotifyUrl &&
                  isValidSpotifyUrl(
                    spotifyUrl
                  ) && (

                    <SpotifyPlayer
                      spotifyUrl={
                        spotifyUrl
                      }
                    />

                  )}

              </div>

            )}


            {/* =============================================
                EXISTING IMAGE PREVIEW
            ============================================= */}

            {!activePanel &&
              imageUrl && (

                <div className="overflow-hidden rounded-md border border-ink/10">

                  <img
                    src={imageUrl}
                    alt="Poem"
                    className="max-h-80 w-full object-contain"
                  />

                </div>

              )}


            {/* =============================================
                EXISTING SPOTIFY
            ============================================= */}

            {!activePanel &&
              spotifyUrl &&
              isValidSpotifyUrl(
                spotifyUrl
              ) && (

                <SpotifyPlayer
                  spotifyUrl={
                    spotifyUrl
                  }
                />

              )}


            {/* =============================================
                SAVE / DELETE
            ============================================= */}

            <div className="mt-2 flex items-center justify-between">

              <Button
                onClick={
                  handleSave
                }
                disabled={
                  saving ||
                  uploadingImage
                }
              >

                {saving
                  ? 'Saving…'
                  : 'Save'}

              </Button>


              <button
                onClick={
                  handleDelete
                }
                className="font-mono text-xs uppercase tracking-wide text-margin/70 hover:text-margin"
              >

                Delete poem

              </button>

            </div>

          </div>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="w-full shrink-0 lg:w-48">

            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-soft">

              Add to this page

            </p>


            <div className="flex flex-col gap-2">

              {/* =========================================
                  SPOTIFY
              ========================================= */}

              <SidebarButton
                label="Spotify song"
                active={
                  activePanel ===
                  'spotify'
                }
                onClick={() =>
                  setActivePanel(
                    activePanel ===
                    'spotify'
                      ? null
                      : 'spotify'
                  )
                }
              />


              {/* =========================================
                  LINK
              ========================================= */}

              <SidebarButton
                label="Link"
                disabled
                title="Coming soon"
              />


              {/* =========================================
                  IMAGE
              ========================================= */}

              <SidebarButton
                label="Picture"
                active={
                  activePanel ===
                  'image'
                }
                onClick={() =>
                  setActivePanel(
                    activePanel ===
                    'image'
                      ? null
                      : 'image'
                  )
                }
              />

            </div>

          </aside>

        </div>

      </div>

    );

  }


  /* =======================================================
     READ-ONLY POEM
  ======================================================= */

  return (

    <div className="mx-auto max-w-5xl px-6 py-12">

      <article className="mx-auto flex max-w-2xl flex-col gap-5">

        <h1 className="font-display text-3xl">
          {poem.title}
        </h1>


        {poem.poem_date && (

          <p className="font-mono text-sm text-ink-soft">
            {poem.poem_date}
          </p>

        )}


        <p className="whitespace-pre-line font-body text-lg leading-relaxed">
          {poem.content}
        </p>


        {poem.image_url && (

          <div className="overflow-hidden rounded-md">

            <img
              src={poem.image_url}
              alt="Poem"
              className="w-full object-contain"
            />

          </div>

        )}


        {poem.spotify_url && (

          <SpotifyPlayer
            spotifyUrl={
              poem.spotify_url
            }
          />

        )}

      </article>

    </div>

  );

}


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function SidebarButton({
  label,
  active,
  disabled,
  title,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        rounded-md
        border
        px-3
        py-2
        text-left
        font-body
        text-sm
        transition-colors

        ${
          active
            ? 'border-margin bg-margin/10 text-margin'
            : disabled
            ? 'cursor-not-allowed border-ink/10 text-ink-soft/50'
            : 'border-ink/10 hover:border-margin/50 hover:text-margin'
        }
      `}
    >

      {label}

    </button>

  );

}