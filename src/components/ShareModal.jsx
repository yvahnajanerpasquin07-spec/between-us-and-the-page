import { useState } from 'react';
import {
  findUserByEmail,
  getSharesForJournal,
  getOrCreatePublicShareToken,
  revokeShare,
  shareJournal,
} from '../services/shareService';
import { useAsync } from '../hooks/useAsync';
import Button from './Button';
import Input from './Input';

export default function ShareModal({
  journalId,
  onClose,
}) {

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    status,
    setStatus,
  ] = useState(null);

  const [
    publicLink,
    setPublicLink,
  ] = useState('');

  const [
    linkLoading,
    setLinkLoading,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const {
    data: shares,
    loading,
    refetch,
  } = useAsync(
    () =>
      getSharesForJournal(
        journalId
      ),
    [journalId]
  );


  async function handleShare(e) {

    e.preventDefault();

    setStatus(null);

    try {

      const person =
        await findUserByEmail(
          email.trim()
        );


      if (!person) {

        setStatus({
          type:
            'error',

          message:
            'No registered user with that email.',
        });

        return;

      }


      await shareJournal(
        journalId,
        person.id
      );


      setEmail('');

      refetch();

    } catch (err) {

      setStatus({
        type:
          'error',

        message:
          err.message,
      });

    }

  }


  async function handleGenerateLink() {

    setStatus(null);
    setCopied(false);
    setLinkLoading(true);

    try {

      const token =
        await getOrCreatePublicShareToken(
          journalId
        );


      const link =
        `${window.location.origin}${import.meta.env.BASE_URL}#/shared/${token}`;


      setPublicLink(
        link
      );

    } catch (err) {

      setStatus({
        type:
          'error',

        message:
          err.message ||
          'Could not create a share link.',
      });

    } finally {

      setLinkLoading(false);

    }

  }


  async function handleCopyLink() {

    if (!publicLink) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        publicLink
      );


      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        2000
      );

    } catch {

      setStatus({
        type:
          'error',

        message:
          'Could not copy the link. Please copy it manually.',
      });

    }

  }


  async function handleRevoke(
    shareId
  ) {

    await revokeShare(
      shareId
    );

    refetch();

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
        bg-ink/40
        p-4
      "
    >

      <div
        className="
          page-card
          w-full
          max-w-md
          bg-paper
          p-6
        "
      >

        <h3
          className="
            mb-4
            font-display
            text-lg
          "
        >
          Share this journal
        </h3>


        {/* =================================================
            VIEW-ONLY LINK
        ================================================= */}

        <div
          className="
            mb-6
            rounded-lg
            border
            border-ink/10
            bg-ink/5
            p-4
          "
        >

          <p
            className="
              mb-1
              font-mono
              text-xs
              uppercase
              tracking-wide
              text-ink-soft
            "
          >
            View-only link
          </p>


          <p
            className="
              mb-3
              text-sm
              text-ink-soft
            "
          >
            Anyone with this link can view the journal,
            but cannot edit it.
          </p>


          {!publicLink ? (

            <Button
              type="button"
              onClick={
                handleGenerateLink
              }
              disabled={
                linkLoading
              }
              className="w-full"
            >
              {linkLoading
                ? 'Creating link…'
                : 'Generate view-only link'}
            </Button>

          ) : (

            <div
              className="
                flex
                flex-col
                gap-2
              "
            >

              <input
                type="text"
                value={
                  publicLink
                }
                readOnly
                className="
                  input-field
                  w-full
                  text-xs
                "
                onFocus={(e) =>
                  e.target.select()
                }
              />


              <Button
                type="button"
                onClick={
                  handleCopyLink
                }
                className="w-full"
              >
                {copied
                  ? 'Copied!'
                  : 'Copy link'}
              </Button>

            </div>

          )}

        </div>


        {/* =================================================
            EMAIL SHARING
        ================================================= */}

        <p
          className="
            mb-2
            font-mono
            text-xs
            uppercase
            tracking-wide
            text-ink-soft
          "
        >
          Share with a registered user
        </p>


        <form
          onSubmit={
            handleShare
          }
          className="
            mb-4
            flex
            gap-2
          "
        >

          <Input
            id="share-email"
            type="email"
            placeholder="reader@example.com"
            value={
              email
            }
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />


          <Button
            type="submit"
          >
            Add
          </Button>

        </form>


        {status?.type === 'error' && (

          <p
            className="
              mb-3
              text-sm
              text-margin
            "
          >
            {status.message}
          </p>

        )}


        <h4
          className="
            mb-2
            font-mono
            text-xs
            uppercase
            tracking-wide
            text-ink-soft
          "
        >
          Current readers
        </h4>


        {loading ? (

          <p
            className="
              text-sm
              text-ink-soft
            "
          >
            Loading…
          </p>

        ) : shares?.length ? (

          <ul
            className="
              flex
              flex-col
              gap-2
            "
          >

            {shares.map(
              (s) => (

                <li
                  key={s.id}
                  className="
                    flex
                    items-center
                    justify-between
                    text-sm
                  "
                >

                  <span>
                    {
                      s.profiles?.email ??
                      s.viewer_id
                    }
                  </span>


                  <button
                    type="button"
                    onClick={() =>
                      handleRevoke(
                        s.id
                      )
                    }
                    className="
                      text-margin
                      hover:underline
                    "
                  >
                    Remove
                  </button>

                </li>

              )
            )}

          </ul>

        ) : (

          <p
            className="
              text-sm
              text-ink-soft
            "
          >
            Not shared with anyone yet.
          </p>

        )}


        <Button
          variant="secondary"
          className="mt-6 w-full"
          onClick={
            onClose
          }
        >
          Done
        </Button>

      </div>

    </div>

  );

}
