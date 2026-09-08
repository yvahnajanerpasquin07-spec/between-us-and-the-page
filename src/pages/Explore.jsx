import { useEffect } from 'react';
import {
  Link,
  useLocation,
} from 'react-router-dom';

import { useAsync } from '../hooks/useAsync';

import {
  getSampleJournals,
} from '../services/journalService';

import JournalCard from '../components/JournalCard';


const faqs = [
  {
    question:
      'Is my journal public?',

    answer:
      'No. Your journals are private by default. You choose when you want to share one.',
  },

  {
    question:
      'Can I attach music to a poem?',

    answer:
      'Yes. A poem can have a Spotify song attached to it, so the page can carry both words and sound.',
  },

  {
    question:
      'What happens when I share a journal?',

    answer:
      'You can share a view-only version of your journal with someone, or invite someone to collaborate with you if you want them to help edit it.',
  },

  {
    question:
      'What is collaboration?',

    answer:
      'Collaboration lets you invite another person to work on a journal with you. Depending on the access you give them, they can help edit and build the journal together with you.',
  },

  {
    question:
      'Can I edit my poems later?',

    answer:
      'Yes. You can return to your journal whenever you want and edit the poems you have already written.',
  },
];


export default function Explore() {

  const location =
    useLocation();


  const {
    data: sampleJournals,
    loading: sampleLoading,
    error: sampleError,
  } = useAsync(
    getSampleJournals
  );


  useEffect(() => {

    const hash =
      location.hash;


    if (!hash) {
      return;
    }


    const timer =
      window.setTimeout(
        () => {

          document
            .querySelector(hash)
            ?.scrollIntoView({
              behavior:
                'smooth',

              block:
                'start',
            });

        },
        50
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    location.hash,
  ]);


  return (

    <div
      className="
        mx-auto
        max-w-5xl
        px-6
        py-14
        sm:py-20
      "
    >

      <section
        className="
          mx-auto
          max-w-2xl
          text-center
        "
      >

        <span
          className="
            font-hand
            text-3xl
            text-margin
          "
        >
          before you turn the page
        </span>


        <h1
          className="
            mt-3
            font-display
            text-4xl
            leading-tight
            text-ink
            sm:text-5xl
          "
        >
          A little place for your words.
        </h1>


        <p
          className="
            mx-auto
            mt-5
            max-w-xl
            font-body
            leading-7
            text-ink-soft
          "
        >
          Explore the idea behind Between Us and the Page,
          see sample journals, and learn how the whole thing works.
        </p>

      </section>


      <section
        id="samples"
        className="
          scroll-mt-24
          pt-20
          sm:pt-28
        "
      >

        <div
          className="
            mb-8
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-ink-soft
            "
          >
            01 / Sample Works
          </p>


          <h2
            className="
              mt-2
              font-display
              text-3xl
              text-ink
              sm:text-4xl
            "
          >
            Imagine your pages here.
          </h2>


          <p
            className="
              mt-3
              max-w-2xl
              font-body
              text-sm
              leading-6
              text-ink-soft
            "
          >
            These are real journals that their owners have chosen
            to feature as public, view-only sample works.
          </p>

        </div>


        {sampleLoading ? (

          <p
            className="
              font-body
              text-sm
              text-ink-soft
            "
          >
            Opening sample journals…
          </p>

        ) : sampleError ? (

          <p
            className="
              font-body
              text-sm
              text-ink-soft
            "
          >
            Sample journals are temporarily unavailable.
          </p>

        ) : sampleJournals?.length ? (

          <div
            className="
              grid
              gap-6
              sm:grid-cols-2
              md:grid-cols-3
            "
          >

            {sampleJournals.map(
              (journal) => (

                <div
                  key={
                    journal.id
                  }
                >

                  <JournalCard

                    journal={
                      journal
                    }

                    readOnly

                    publicShareToken={
                      journal.public_share_token
                    }

                  />

                </div>

              )
            )}

          </div>

        ) : (

          <div
            className="
              page-card
              bg-paper
              p-8
              text-center
            "
          >

            <p
              className="
                font-hand
                text-2xl
                text-margin
              "
            >
              No sample journals yet.
            </p>


            <p
              className="
                mt-2
                font-body
                text-sm
                text-ink-soft
              "
            >
              Sample works will appear here when one is featured.
            </p>

          </div>

        )}

      </section>


      <section
        id="how-it-works"
        className="
          scroll-mt-24
          pt-20
          sm:pt-28
        "
      >

        <div
          className="
            mb-8
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-ink-soft
            "
          >
            02 / How It Works
          </p>


          <h2
            className="
              mt-2
              font-display
              text-3xl
              text-ink
              sm:text-4xl
            "
          >
            From a blank page to a book.
          </h2>

        </div>


        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          {[
            [
              '01',
              'Create',
              'Start a private journal and give it a cover, title, and personality.',
            ],

            [
              '02',
              'Write',
              'Add poems to your pages and arrange them into your own little book.',
            ],

            [
              '03',
              'Add music',
              'Attach a Spotify song to a poem when you want the page to have a soundtrack.',
            ],

            [
              '04',
              'Share',
              'Share your journal privately with someone, either as view-only or through collaboration.',
            ],

          ].map(
            ([
              number,
              title,
              description,
            ]) => (

              <article
                key={
                  number
                }
                className="
                  border-t
                  border-ink/15
                  pt-5
                "
              >

                <span
                  className="
                    font-mono
                    text-xs
                    text-ink-soft
                  "
                >
                  {number}
                </span>


                <h3
                  className="
                    mt-4
                    font-display
                    text-2xl
                    text-ink
                  "
                >
                  {title}
                </h3>


                <p
                  className="
                    mt-2
                    font-body
                    text-sm
                    leading-6
                    text-ink-soft
                  "
                >
                  {description}
                </p>

              </article>

            )
          )}

        </div>

      </section>


      <section
        id="collaboration"
        className="
          scroll-mt-24
          pt-20
          sm:pt-28
        "
      >

        <div
          className="
            border-t
            border-ink/10
            pt-10
            sm:pt-12
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-ink-soft
            "
          >
            03 / Collaboration
          </p>


          <div
            className="
              mt-3
              grid
              gap-8
              lg:grid-cols-[1fr_1.2fr]
              lg:items-center
            "
          >

            <div>

              <h2
                className="
                  font-display
                  text-3xl
                  text-ink
                  sm:text-4xl
                "
              >
                Some pages are better written together.
              </h2>

            </div>


            <div>

              <p
                className="
                  font-body
                  text-sm
                  leading-7
                  text-ink-soft
                "
              >
                Invite someone into your journal and create
                something together. Collaboration lets you give
                another person access to help edit and build the
                pages with you, while your journal remains yours.
              </p>


              <p
                className="
                  mt-4
                  font-body
                  text-sm
                  leading-7
                  text-ink-soft
                "
              >
                Want someone to simply read what you wrote?
                You can still share a view-only version instead.
              </p>

            </div>

          </div>

        </div>

      </section>


      <section
        id="faqs"
        className="
          scroll-mt-24
          pt-20
          sm:pt-28
        "
      >

        <div
          className="
            mb-8
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-ink-soft
            "
          >
            04 / FAQs
          </p>


          <h2
            className="
              mt-2
              font-display
              text-3xl
              text-ink
              sm:text-4xl
            "
          >
            A few things you might ask.
          </h2>

        </div>


        <div
          className="
            mx-auto
            max-w-3xl
            divide-y
            divide-ink/10
            border-y
            border-ink/10
          "
        >

          {faqs.map(
            (faq) => (

              <details
                key={
                  faq.question
                }
                className="
                  group
                  py-5
                "
              >

                <summary
                  className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-6
                    font-display
                    text-xl
                    text-ink
                    [&::-webkit-details-marker]:hidden
                  "
                >

                  {faq.question}

                  <span
                    className="
                      font-mono
                      text-lg
                      text-ink-soft
                      transition-transform
                      group-open:rotate-45
                    "
                  >
                    +
                  </span>

                </summary>


                <p
                  className="
                    mt-3
                    max-w-2xl
                    pr-8
                    font-body
                    text-sm
                    leading-6
                    text-ink-soft
                  "
                >
                  {faq.answer}
                </p>

              </details>

            )
          )}

        </div>

      </section>


      <section
        className="
          mt-20
          border-t
          border-ink/10
          pt-10
          text-center
          sm:mt-28
        "
      >

        <p
          className="
            font-hand
            text-2xl
            text-margin
          "
        >
          when you're ready...
        </p>


        <Link
          to="/register"
          className="
            btn-primary
            mt-5
            inline-flex
          "
        >
          Start your first journal →
        </Link>

      </section>

    </div>

  );

}
