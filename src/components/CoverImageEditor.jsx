import {
  useEffect,
  useRef,
  useState,
} from 'react';


/* =========================================================
   CONSTANTS
========================================================= */

const COVER_WIDTH = 360;
const COVER_HEIGHT = 480;

const DEFAULT_SETTINGS = {
  x: 0,
  y: 0,
  zoom: 1,
};


/* =========================================================
   COVER IMAGE EDITOR
========================================================= */

export default function CoverImageEditor({
  frontImageUrl,
  backImageUrl,
  frontSettings = DEFAULT_SETTINGS,
  backSettings = DEFAULT_SETTINGS,
  onFrontChange,
  onBackChange,
}) {

  const [
    activeSide,
    setActiveSide,
  ] = useState('front');


  const [
    isDragging,
    setIsDragging,
  ] = useState(false);


  const dragStartRef =
    useRef(null);


  const currentImageUrl =
    activeSide === 'front'
      ? frontImageUrl
      : backImageUrl;


  const currentSettings =
    activeSide === 'front'
      ? {
          ...DEFAULT_SETTINGS,
          ...frontSettings,
        }
      : {
          ...DEFAULT_SETTINGS,
          ...backSettings,
        };


  function updateCurrentSide(updates) {

    const next = {
      ...currentSettings,
      ...updates,
    };


    if (activeSide === 'front') {

      onFrontChange(next);

    } else {

      onBackChange(next);

    }

  }


  /* =======================================================
     DRAGGING
  ======================================================= */

  function handlePointerDown(e) {

    if (!currentImageUrl) {
      return;
    }


    e.preventDefault();

    setIsDragging(true);


    dragStartRef.current = {

      clientX:
        e.clientX,

      clientY:
        e.clientY,

      x:
        currentSettings.x,

      y:
        currentSettings.y,

    };


    e.currentTarget.setPointerCapture?.(
      e.pointerId
    );

  }


  function handlePointerMove(e) {

    if (
      !isDragging ||
      !dragStartRef.current
    ) {
      return;
    }


    const deltaX =
      e.clientX -
      dragStartRef.current.clientX;


    const deltaY =
      e.clientY -
      dragStartRef.current.clientY;


    const nextX =
      dragStartRef.current.x +
      (deltaX / 3);


    const nextY =
      dragStartRef.current.y +
      (deltaY / 3);


    updateCurrentSide({

      x:
        Math.max(
          -100,
          Math.min(
            100,
            nextX
          )
        ),

      y:
        Math.max(
          -100,
          Math.min(
            100,
            nextY
          )
        ),

    });

  }


  function handlePointerUp() {

    setIsDragging(false);

    dragStartRef.current = null;

  }


  /* =======================================================
     RESET
  ======================================================= */

  function resetCurrentSide() {

    updateCurrentSide({
      ...DEFAULT_SETTINGS,
    });

  }


  /* =======================================================
     CREATE CROPPED IMAGE
  ======================================================= */

  async function createCroppedImage(
    imageUrl,
    settings
  ) {

    if (!imageUrl) {
      return null;
    }


    const image =
      new Image();


    image.crossOrigin =
      'anonymous';


    await new Promise(
      (resolve, reject) => {

        image.onload =
          resolve;

        image.onerror =
          reject;

        image.src =
          imageUrl;

      }
    );


    const canvas =
      document.createElement(
        'canvas'
      );


    canvas.width =
      COVER_WIDTH;

    canvas.height =
      COVER_HEIGHT;


    const context =
      canvas.getContext(
        '2d'
      );


    if (!context) {

      throw new Error(
        'Could not prepare the cover image.'
      );

    }


    const baseScale =
      Math.max(
        COVER_WIDTH / image.naturalWidth,
        COVER_HEIGHT / image.naturalHeight
      );


    const scale =
      baseScale *
      settings.zoom;


    const width =
      image.naturalWidth *
      scale;


    const height =
      image.naturalHeight *
      scale;


    const centeredX =
      (COVER_WIDTH - width) / 2;


    const centeredY =
      (COVER_HEIGHT - height) / 2;


    const offsetX =
      settings.x *
      2.5;


    const offsetY =
      settings.y *
      2.5;


    context.drawImage(
      image,
      centeredX + offsetX,
      centeredY + offsetY,
      width,
      height
    );


    return new Promise(
      (resolve, reject) => {

        canvas.toBlob(
          (blob) => {

            if (!blob) {

              reject(
                new Error(
                  'Could not create the cover image.'
                )
              );

              return;

            }


            resolve(blob);

          },
          'image/jpeg',
          0.92
        );

      }
    );

  }


  /* =======================================================
     EXPOSE CROPPED IMAGES TO DASHBOARD
  ======================================================= */

  useEffect(() => {

    window.__betweenUsCreateCoverImages =
      async (side = null) => {

        const front =
          side === 'back'
            ? null
            : await createCroppedImage(
                frontImageUrl,
                {
                  ...DEFAULT_SETTINGS,
                  ...frontSettings,
                }
              );


        const back =
          side === 'front'
            ? null
            : await createCroppedImage(
                backImageUrl,
                {
                  ...DEFAULT_SETTINGS,
                  ...backSettings,
                }
              );


        return {
          front,
          back,
        };

      };


    return () => {

      delete window.__betweenUsCreateCoverImages;

    };

  }, [
    frontImageUrl,
    backImageUrl,
    frontSettings,
    backSettings,
  ]);


  /* =======================================================
     PREVIEW
  ======================================================= */

  function CoverPreview({
    imageUrl,
    settings,
    side,
  }) {

    const isActive =
      activeSide === side;


    return (

      <button
        type="button"
        onClick={() =>
          setActiveSide(side)
        }
        className={`
          relative
          overflow-hidden
          rounded-r-xl
          border
          bg-black
          shadow-lg
          transition-all
          duration-200
          ${
            isActive
              ? 'scale-[1.02] border-margin ring-2 ring-margin/30'
              : 'border-ink/15 opacity-80'
          }
        `}
        style={{

          width:
            'min(42vw, 240px)',

          aspectRatio:
            '3 / 4',

          cursor:
            imageUrl &&
            isActive &&
            isDragging
              ? 'grabbing'
              : imageUrl
                ? 'pointer'
                : 'default',

        }}
      >

        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
          onPointerDown={
            isActive
              ? handlePointerDown
              : undefined
          }
          onPointerMove={
            isActive
              ? handlePointerMove
              : undefined
          }
          onPointerUp={
            isActive
              ? handlePointerUp
              : undefined
          }
          onPointerCancel={
            isActive
              ? handlePointerUp
              : undefined
          }
          style={{
            touchAction:
              'none',
          }}
        >

          {imageUrl ? (

            <img
              src={imageUrl}
              alt={`${side} cover preview`}
              draggable="false"
              className="
                absolute
                left-1/2
                top-1/2
                max-w-none
                select-none
              "
              style={{

                width:
                  '100%',

                height:
                  '100%',

                objectFit:
                  'cover',

                transform:
                  `translate(
                    calc(-50% + ${settings.x}%),
                    calc(-50% + ${settings.y}%)
                  ) scale(${settings.zoom})`,

                pointerEvents:
                  'none',

              }}
            />

          ) : (

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                p-5
                text-center
              "
            >

              <span
                className="
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-white/70
                "
              >
                No image selected
              </span>

            </div>

          )}


          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/10
            "
          />

        </div>


        <div
          className="
            pointer-events-none
            absolute
            left-2
            top-2
            rounded-full
            bg-black/55
            px-2.5
            py-1
            font-mono
            text-[9px]
            uppercase
            tracking-wide
            text-white
          "
        >

          {side === 'front'
            ? 'Front cover'
            : 'Back cover'}

        </div>

      </button>

    );

  }


  return (

    <div
      className="
        rounded-lg
        border
        border-ink/10
        bg-paper/60
        p-4
      "
    >

      <div className="mb-4">

        <p
          className="
            font-mono
            text-xs
            uppercase
            tracking-wide
            text-ink-soft
          "
        >
          Adjust your cover
        </p>


        <p
          className="
            mt-1
            font-body
            text-sm
            text-ink-soft
          "
        >
          Select a side, then drag the image and use the
          zoom control until it looks the way you want.
        </p>

      </div>


      <div
        className="
          flex
          flex-wrap
          items-center
          justify-center
          gap-5
        "
      >

        <CoverPreview
          imageUrl={frontImageUrl}
          settings={{
            ...DEFAULT_SETTINGS,
            ...frontSettings,
          }}
          side="front"
        />


        <div
          className="
            hidden
            h-32
            w-px
            bg-ink/10
            sm:block
          "
        />


        <CoverPreview
          imageUrl={backImageUrl}
          settings={{
            ...DEFAULT_SETTINGS,
            ...backSettings,
          }}
          side="back"
        />

      </div>


      {currentImageUrl ? (

        <div
          className="
            mt-5
            rounded-md
            border
            border-ink/10
            bg-paper
            p-4
          "
        >

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-3
            "
          >

            <div>

              <p
                className="
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-ink-soft
                "
              >
                Editing
              </p>


              <p className="font-display text-lg">

                {activeSide === 'front'
                  ? 'Front cover'
                  : 'Back cover'}

              </p>

            </div>


            <button
              type="button"
              onClick={resetCurrentSide}
              className="
                rounded-md
                border
                border-ink/15
                px-3
                py-1.5
                font-mono
                text-[10px]
                uppercase
                tracking-wide
                text-ink-soft
                transition-colors
                hover:border-ink/30
                hover:bg-ink/5
              "
            >
              Reset
            </button>

          </div>


          <label
            className="
              flex
              flex-col
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                font-mono
                text-[10px]
                uppercase
                tracking-wide
                text-ink-soft
              "
            >

              <span>
                Image size
              </span>

              <span>
                {Math.round(
                  currentSettings.zoom *
                  100
                )}%
              </span>

            </div>


            <input
              type="range"
              min="1"
              max="2.5"
              step="0.01"
              value={
                currentSettings.zoom
              }
              onChange={(e) =>
                updateCurrentSide({
                  zoom:
                    Number(
                      e.target.value
                    ),
                })
              }
              className="w-full accent-ink"
            />

          </label>


          <label
            className="
              mt-4
              flex
              flex-col
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                font-mono
                text-[10px]
                uppercase
                tracking-wide
                text-ink-soft
              "
            >

              <span>
                Horizontal
              </span>

              <span>
                {Math.round(
                  currentSettings.x
                )}
              </span>

            </div>


            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={
                currentSettings.x
              }
              onChange={(e) =>
                updateCurrentSide({
                  x:
                    Number(
                      e.target.value
                    ),
                })
              }
              className="w-full accent-ink"
            />

          </label>


          <label
            className="
              mt-4
              flex
              flex-col
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                font-mono
                text-[10px]
                uppercase
                tracking-wide
                text-ink-soft
              "
            >

              <span>
                Vertical
              </span>

              <span>
                {Math.round(
                  currentSettings.y
                )}
              </span>

            </div>


            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={
                currentSettings.y
              }
              onChange={(e) =>
                updateCurrentSide({
                  y:
                    Number(
                      e.target.value
                    ),
                })
              }
              className="w-full accent-ink"
            />

          </label>

        </div>

      ) : null}

    </div>

  );

}


/* =========================================================
   EXPORT HELPER
========================================================= */

export async function createCoverImages(
  side = null
) {

  if (
    typeof window === 'undefined' ||
    !window.__betweenUsCreateCoverImages
  ) {

    throw new Error(
      'Cover editor is not ready yet.'
    );

  }


  return await window.__betweenUsCreateCoverImages(
    side
  );

}