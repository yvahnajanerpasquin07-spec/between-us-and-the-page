const MATERIALS = {
  kraft: {
    label: 'Kraft',
    base: '#c9a876',
    texture:
      'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 3px)',
    spineColor: '#8a6f47',
  },

  velvet: {
    label: 'Velvet',
    base: '#7a1f2b',
    texture:
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)',
    spineColor: '#4d1119',
  },

  leather: {
    label: 'Leather',
    base: '#3a2a1e',
    texture:
      'repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 6px)',
    spineColor: '#221812',
  },
};


export function materialOptions() {

  return Object.entries(
    MATERIALS
  ).map(
    ([value, material]) => ({
      value,
      label: material.label,
    })
  );

}


/* =========================================================
   FRONT COVER
========================================================= */

export default function NotebookCover({
  title,
  description,
  date,
  authorName,
  coverColor,
  coverMaterial = 'kraft',
  coverImageUrl,
  readOnly,
}) {

  const material =
    MATERIALS[coverMaterial] ??
    MATERIALS.kraft;


  const bg =
    coverColor ||
    material.base;


  return (

    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        rounded-r-[14px]
      "
      style={{
        backgroundColor:
          bg,

        backgroundImage:
          coverImageUrl
            ? `
                linear-gradient(
                  rgba(0,0,0,0.35),
                  rgba(0,0,0,0.45)
                ),
                url(${coverImageUrl}),
                ${material.texture}
              `
            : material.texture,

        backgroundSize:
          coverImageUrl
            ? 'cover, cover, auto'
            : 'auto',

        backgroundPosition:
          coverImageUrl
            ? 'center, center, center'
            : 'center',

        boxShadow:
          '0 8px 18px rgba(0,0,0,0.20)',

        border:
          '1px solid rgba(0,0,0,0.25)',
      }}
    >

      {/* ============================================
          COVER CONTENT
      ============================================ */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          flex-col
          items-center
          justify-center
          gap-3
          p-6
          pl-10
          text-center
          text-white
        "
      >

        <h3
          className="
            font-display
            text-xl
            drop-shadow-sm
          "
        >

          {title}

        </h3>


        {description && (

          <p
            className="
              line-clamp-3
              font-body
              text-sm
              text-white/85
            "
          >

            {description}

          </p>

        )}


        {authorName && (

          <p
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-wide
              text-white/70
            "
          >

            By: {authorName}

          </p>

        )}


        <p
          className="
            font-mono
            text-[10px]
            uppercase
            tracking-wide
            text-white/70
          "
        >

          {date}

        </p>


        {readOnly && (

          <span
            className="
              font-mono
              text-[10px]
              uppercase
              tracking-wide
              text-white/70
            "
          >

            View only

          </span>

        )}

      </div>


      {/* ============================================
          FRONT COVER SPINE
          LEFT SIDE
      ============================================ */}

      <div
        className="
          absolute
          left-0
          top-0
          z-20
          h-full
          w-7
        "
        style={{
          background:
            `linear-gradient(
              to right,
              ${material.spineColor},
              ${material.spineColor}dd 70%,
              transparent
            )`,

          boxShadow:
            'inset -2px 0 4px rgba(0,0,0,0.4)',
        }}
      >

        <div
          className="
            flex
            h-full
            flex-col
            items-center
            justify-evenly
            py-4
          "
        >

          {Array.from({
            length: 6,
          }).map(
            (_, index) => (

              <div
                key={index}
                className="
                  h-px
                  w-4
                  bg-black/30
                "
              />

            )
          )}

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   INSIDE OF FRONT COVER

   NO SPINE
========================================================= */

export function InsideCoverPanel({
  coverColor,
  coverMaterial = 'kraft',
}) {

  const material =
    MATERIALS[coverMaterial] ??
    MATERIALS.kraft;


  const bg =
    coverColor ||
    material.base;


  return (

    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        rounded-l-[14px]
      "
      style={{
        backgroundColor:
          bg,

        backgroundImage:
          material.texture,

        boxShadow:
          'inset -8px 0 15px rgba(0,0,0,0.08)',
      }}
    >

      {/*

        Intentionally no spine here.

        The inside front cover should be completely
        clean and match the selected cover material.

      */}

    </div>

  );

}