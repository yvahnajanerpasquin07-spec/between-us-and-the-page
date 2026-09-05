import {
  useState,
} from 'react';


/* =========================================================
   COVER MATERIALS
========================================================= */

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


/* =========================================================
   MATERIAL OPTIONS
   ---------------------------------------------------------
   Dashboard.jsx imports this as a named export.
========================================================= */

export const materialOptions = Object.entries(
  MATERIALS
).map(([value, material]) => ({
  value,
  label: material.label,
}));


/* =========================================================
   COVER TEXT STYLE STORAGE
========================================================= */

const COVER_STYLE_STORAGE_KEY =
  'between-us-cover-text-styles';


const DEFAULT_COVER_TEXT_STYLES = {

  title: {
    fontFamily:
      'Georgia, "Times New Roman", serif',

    fontSize:
      20,

    fontWeight:
      400,

    fontStyle:
      'normal',

    textAlign:
      'center',

    letterSpacing:
      0,

    lineHeight:
      1.2,

    color:
      '#ffffff',
  },


  description: {
    fontFamily:
      'Georgia, "Times New Roman", serif',

    fontSize:
      14,

    fontWeight:
      400,

    fontStyle:
      'normal',

    textAlign:
      'center',

    letterSpacing:
      0,

    lineHeight:
      1.4,

    color:
      '#ffffff',
  },


  author: {
    fontFamily:
      'monospace',

    fontSize:
      10,

    fontWeight:
      400,

    fontStyle:
      'normal',

    textAlign:
      'center',

    letterSpacing:
      1,

    lineHeight:
      1.4,

    color:
      '#ffffff',
  },

};


/* =========================================================
   COVER STYLE HELPERS
========================================================= */

function getStoredCoverStyles(
  journalId
) {

  if (
    typeof window === 'undefined'
  ) {

    return DEFAULT_COVER_TEXT_STYLES;

  }


  try {

    const stored =
      JSON.parse(
        localStorage.getItem(
          COVER_STYLE_STORAGE_KEY
        ) || '{}'
      );


    const saved =
      stored[journalId];


    if (!saved) {

      return DEFAULT_COVER_TEXT_STYLES;

    }


    return {

      ...DEFAULT_COVER_TEXT_STYLES,

      ...saved,

      title: {
        ...DEFAULT_COVER_TEXT_STYLES.title,
        ...(saved.title || {}),
      },

      description: {
        ...DEFAULT_COVER_TEXT_STYLES.description,
        ...(saved.description || {}),
      },

      author: {
        ...DEFAULT_COVER_TEXT_STYLES.author,
        ...(saved.author || {}),
      },

    };

  } catch {

    return DEFAULT_COVER_TEXT_STYLES;

  }

}


function saveStoredCoverStyles(
  journalId,
  styles
) {

  if (
    typeof window === 'undefined'
  ) {

    return;

  }


  try {

    const stored =
      JSON.parse(
        localStorage.getItem(
          COVER_STYLE_STORAGE_KEY
        ) || '{}'
      );


    stored[journalId] =
      styles;


    localStorage.setItem(
      COVER_STYLE_STORAGE_KEY,
      JSON.stringify(stored)
    );

  } catch {
    // Ignore localStorage errors.
  }

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
  spineColor,
  readOnly,
  journalId,
  isOwner,
  onEditJournal,
  onDeleteJournal,
}) {

  const material =
    MATERIALS[coverMaterial] ??
    MATERIALS.kraft;


  const bg =
    coverColor ||
    material.base;


  const effectiveSpineColor =
    spineColor ||
    material.spineColor;


  const hasCoverImage =
    typeof coverImageUrl === 'string' &&
    coverImageUrl.trim() !== '';


  /* =======================================================
     TEXT STYLE STATE
  ======================================================= */

  const [
    showTextStyles,
    setShowTextStyles,
  ] = useState(false);


  const [
    textStyles,
    setTextStyles,
  ] = useState(
    () =>
      getStoredCoverStyles(
        journalId
      )
  );


  /* =======================================================
     UPDATE COVER STYLE
  ======================================================= */

  function updateStyle(
    section,
    property,
    value
  ) {

    setTextStyles(
      (previous) => {

        const next = {

          ...previous,

          [section]: {

            ...previous[section],

            [property]:
              value,

          },

        };


        saveStoredCoverStyles(
          journalId,
          next
        );


        return next;

      }
    );

  }


  /* =======================================================
     RESET COVER STYLES
  ======================================================= */

  function resetStyles() {

    const next = {

      title: {
        ...DEFAULT_COVER_TEXT_STYLES.title,
      },

      description: {
        ...DEFAULT_COVER_TEXT_STYLES.description,
      },

      author: {
        ...DEFAULT_COVER_TEXT_STYLES.author,
      },

    };


    setTextStyles(
      next
    );


    saveStoredCoverStyles(
      journalId,
      next
    );

  }


  /* =======================================================
     INLINE TEXT STYLE HELPER
  ======================================================= */

  function textStyle(
    style
  ) {

    return {

      fontFamily:
        style.fontFamily,

      fontSize:
        `${style.fontSize}px`,

      fontWeight:
        style.fontWeight,

      fontStyle:
        style.fontStyle,

      textAlign:
        style.textAlign,

      letterSpacing:
        `${style.letterSpacing}px`,

      lineHeight:
        style.lineHeight,

      color:
        style.color,

      textShadow:
        '0 1px 3px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.55)',

    };

  }


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
          hasCoverImage
            ? `
              url("${coverImageUrl}"),
              ${material.texture}
            `
            : material.texture,

        backgroundSize:
          hasCoverImage
            ? 'cover, auto'
            : 'auto',

        backgroundPosition:
          hasCoverImage
            ? 'center, center'
            : 'center',

        backgroundRepeat:
          'no-repeat',

        boxShadow:
          '0 8px 18px rgba(0,0,0,0.20)',

        border:
          '1px solid rgba(0,0,0,0.25)',

      }}

    >

      {/* =================================================
          COVER CONTENT
      ================================================= */}

      <div

        className="
          relative
          z-10
          flex
          h-full
          w-full
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

        {/* =================================================
            TITLE
        ================================================= */}

        <h3

          className="
            font-display
            drop-shadow-sm
          "

          style={
            textStyle(
              textStyles.title
            )
          }

        >

          {title}

        </h3>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {description && (

          <p

            className="
              line-clamp-3
              font-body
            "

            style={
              textStyle(
                textStyles.description
              )
            }

          >

            {description}

          </p>

        )}


        {/* =================================================
            AUTHOR
        ================================================= */}

        {authorName && (

          <p

            className="
              font-mono
              uppercase
            "

            style={
              textStyle(
                textStyles.author
              )
            }

          >

            By: {authorName}

          </p>

        )}


        {/* =================================================
            DATE

            Date is intentionally unchanged.
        ================================================= */}

        {date && (

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

        )}


        {/* =================================================
            VIEW ONLY
        ================================================= */}

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


      {/* =================================================
          COVER TOOLS
          -------------------------------------------------
          Text customization, edit, and delete controls
          stay together in the bottom-right corner.
      ================================================= */}

      {isOwner && (

        <div
          onClick={(e) =>
            e.stopPropagation()
          }
          style={{
            position:
              'absolute',

            right:
              '16px',

            bottom:
              '16px',

            zIndex:
              100,

            display:
              'flex',

            alignItems:
              'center',

            gap:
              '6px',
          }}
        >

          {/* TEXT STYLE BUTTON */}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              setShowTextStyles(
                (previous) =>
                  !previous
              );
            }}
            aria-label="Cover text style"
            title="Cover text style"
            style={{
              width:
                '30px',

              height:
                '30px',

              padding:
                0,

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              border:
                '1px solid rgba(255,255,255,0.35)',

              borderRadius:
                '50%',

              background:
                'rgba(0,0,0,0.18)',

              color:
                '#ffffff',

              cursor:
                'pointer',

              backdropFilter:
                'blur(3px)',
            }}
          >

            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16" />
              <path d="M12 5v14" />
              <path d="M8 19h8" />
            </svg>

          </button>


          {/* EDIT JOURNAL BUTTON */}

          {onEditJournal && (

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditJournal();
              }}
              aria-label="Edit journal"
              title="Edit journal"
              style={{
                width:
                  '30px',

                height:
                  '30px',

                padding:
                  0,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                border:
                  '1px solid rgba(255,255,255,0.35)',

                borderRadius:
                  '50%',

                background:
                  'rgba(0,0,0,0.18)',

                color:
                  '#ffffff',

                cursor:
                  'pointer',

                backdropFilter:
                  'blur(3px)',
              }}
            >

              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>

            </button>

          )}


          {/* DELETE JOURNAL BUTTON */}

          {onDeleteJournal && (

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteJournal();
              }}
              aria-label="Delete journal"
              title="Delete journal"
              style={{
                width:
                  '30px',

                height:
                  '30px',

                padding:
                  0,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                border:
                  '1px solid rgba(255,255,255,0.35)',

                borderRadius:
                  '50%',

                background:
                  'rgba(0,0,0,0.18)',

                color:
                  '#ffffff',

                cursor:
                  'pointer',

                backdropFilter:
                  'blur(3px)',
              }}
            >

              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>

            </button>

          )}

        </div>

      )}

      {/* =================================================
          COVER TEXT STYLE PANEL
      ================================================= */}

      {showTextStyles && isOwner && (

        <div

          onClick={(e) =>
            e.stopPropagation()
          }

          style={{

            position:
              'absolute',

            right:
              '12px',

            bottom:
              '52px',

            zIndex:
              200,

            width:
              '260px',

            maxHeight:
              '390px',

            overflowY:
              'auto',

            padding:
              '12px',

            border:
              '1px solid rgba(43,42,40,0.16)',

            borderRadius:
              '8px',

            background:
              '#f8f4e9',

            color:
              '#2b2a27',

            boxShadow:
              '0 10px 30px rgba(0,0,0,0.25)',

            fontFamily:
              'Georgia, "Times New Roman", serif',

          }}

        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div

            style={{

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              marginBottom:
                '10px',

              paddingBottom:
                '8px',

              borderBottom:
                '1px solid rgba(43,42,40,0.10)',

              fontFamily:
                'monospace',

              fontSize:
                '10px',

              textTransform:
                'uppercase',

              letterSpacing:
                '1px',

            }}

          >

            <span>
              Cover Text Style
            </span>


            <button

              type="button"

              onClick={() =>
                setShowTextStyles(
                  false
                )
              }

              aria-label="Close cover text styles"

              style={{

                border:
                  0,

                background:
                  'transparent',

                fontSize:
                  '18px',

                lineHeight:
                  1,

                cursor:
                  'pointer',

                color:
                  '#403e39',

              }}

            >

              ×

            </button>

          </div>


          {/* =================================================
              TITLE
          ================================================= */}

          <CoverTextStyleSection

            label="Title"

            style={
              textStyles.title
            }

            onChange={(
              property,
              value
            ) =>
              updateStyle(
                'title',
                property,
                value
              )
            }

          />


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <CoverTextStyleSection

            label="Description"

            style={
              textStyles.description
            }

            onChange={(
              property,
              value
            ) =>
              updateStyle(
                'description',
                property,
                value
              )
            }

          />


          {/* =================================================
              AUTHOR
          ================================================= */}

          <CoverTextStyleSection

            label="By / Author"

            style={
              textStyles.author
            }

            onChange={(
              property,
              value
            ) =>
              updateStyle(
                'author',
                property,
                value
              )
            }

          />


          {/* =================================================
              RESET
          ================================================= */}

          <button

            type="button"

            onClick={
              resetStyles
            }

            style={{

              width:
                '100%',

              marginTop:
                '6px',

              padding:
                '8px',

              border:
                '1px solid rgba(43,42,40,0.15)',

              borderRadius:
                '4px',

              background:
                'transparent',

              color:
                '#b23a2e',

              fontFamily:
                'monospace',

              fontSize:
                '9px',

              textTransform:
                'uppercase',

              letterSpacing:
                '0.8px',

              cursor:
                'pointer',

            }}

          >

            Reset styles

          </button>

        </div>

      )}


      {/* =================================================
          FRONT COVER SPINE
      ================================================= */}

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
              ${effectiveSpineColor},
              ${effectiveSpineColor}dd 70%,
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
          }).map((_, index) => (

            <div

              key={index}

              className="
                h-px
                w-4
                bg-black/30
              "

            />

          ))}

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   COVER TEXT STYLE SECTION
========================================================= */

function CoverTextStyleSection({
  label,
  style,
  onChange,
}) {

  const labelStyle = {

    display:
      'block',

    marginBottom:
      '7px',

    paddingTop:
      '8px',

    fontFamily:
      'monospace',

    fontSize:
      '9px',

    fontWeight:
      600,

    textTransform:
      'uppercase',

    letterSpacing:
      '0.8px',

    color:
      '#403e39',

  };


  const fieldLabelStyle = {

    display:
      'flex',

    flexDirection:
      'column',

    gap:
      '4px',

    fontFamily:
      'monospace',

    fontSize:
      '8px',

    color:
      '#77736b',

  };


  const inputStyle = {

    width:
      '100%',

    minWidth:
      0,

    padding:
      '5px 6px',

    border:
      '1px solid rgba(43,42,40,0.15)',

    borderRadius:
      '3px',

    background:
      '#ffffff',

    color:
      '#2b2a27',

    fontSize:
      '9px',

    outline:
      'none',

  };


  return (

    <div>

      <div
        style={labelStyle}
      >

        {label}

      </div>


      {/* =================================================
          FONT
      ================================================= */}

      <label
        style={fieldLabelStyle}
      >

        <span>
          Font
        </span>


        <select

          value={
            style.fontFamily
          }

          onChange={(e) =>
            onChange(
              'fontFamily',
              e.target.value
            )
          }

          style={inputStyle}

        >

          <option value='Georgia, "Times New Roman", serif'>
            Georgia
          </option>

          <option value='Arial, Helvetica, sans-serif'>
            Arial
          </option>

          <option value='Verdana, sans-serif'>
            Verdana
          </option>

          <option value='"Trebuchet MS", sans-serif'>
            Trebuchet
          </option>

          <option value='"Courier New", monospace'>
            Courier
          </option>

          <option value='monospace'>
            Monospace
          </option>

          <option value='serif'>
            Serif
          </option>

          <option value='sans-serif'>
            Sans Serif
          </option>

        </select>

      </label>


      {/* =================================================
          SIZE + WEIGHT
      ================================================= */}

      <div

        style={{

          display:
            'grid',

          gridTemplateColumns:
            '1fr 1fr',

          gap:
            '7px',

          marginTop:
            '7px',

        }}

      >

        <label
          style={fieldLabelStyle}
        >

          <span>
            Size
          </span>


          <input

            type="number"

            min="8"

            max="72"

            value={
              style.fontSize
            }

            onChange={(e) =>
              onChange(
                'fontSize',
                Number(
                  e.target.value
                )
              )
            }

            style={inputStyle}

          />

        </label>


        <label
          style={fieldLabelStyle}
        >

          <span>
            Weight
          </span>


          <select

            value={
              style.fontWeight
            }

            onChange={(e) =>
              onChange(
                'fontWeight',
                Number(
                  e.target.value
                )
              )
            }

            style={inputStyle}

          >

            <option value="300">
              Light
            </option>

            <option value="400">
              Regular
            </option>

            <option value="500">
              Medium
            </option>

            <option value="600">
              Semi Bold
            </option>

            <option value="700">
              Bold
            </option>

          </select>

        </label>

      </div>


      {/* =================================================
          ALIGN + COLOR
      ================================================= */}

      <div

        style={{

          display:
            'grid',

          gridTemplateColumns:
            '1fr 1fr',

          gap:
            '7px',

          marginTop:
            '7px',

        }}

      >

        <label
          style={fieldLabelStyle}
        >

          <span>
            Align
          </span>


          <select

            value={
              style.textAlign
            }

            onChange={(e) =>
              onChange(
                'textAlign',
                e.target.value
              )
            }

            style={inputStyle}

          >

            <option value="left">
              Left
            </option>

            <option value="center">
              Center
            </option>

            <option value="right">
              Right
            </option>

            <option value="justify">
              Justify
            </option>

          </select>

        </label>


        <label
          style={fieldLabelStyle}
        >

          <span>
            Color
          </span>


          <input

            type="color"

            value={
              style.color
            }

            onChange={(e) =>
              onChange(
                'color',
                e.target.value
              )
            }

            style={{

              width:
                '100%',

              height:
                '28px',

              padding:
                '2px',

              border:
                '1px solid rgba(43,42,40,0.15)',

              borderRadius:
                '3px',

              background:
                '#ffffff',

              cursor:
                'pointer',

            }}

          />

        </label>

      </div>


      {/* =================================================
          SPACING + LINE HEIGHT
      ================================================= */}

      <div

        style={{

          display:
            'grid',

          gridTemplateColumns:
            '1fr 1fr',

          gap:
            '7px',

          marginTop:
            '7px',

        }}

      >

        <label
          style={fieldLabelStyle}
        >

          <span>
            Spacing
          </span>


          <input

            type="number"

            min="-3"

            max="10"

            step="0.5"

            value={
              style.letterSpacing
            }

            onChange={(e) =>
              onChange(
                'letterSpacing',
                Number(
                  e.target.value
                )
              )
            }

            style={inputStyle}

          />

        </label>


        <label
          style={fieldLabelStyle}
        >

          <span>
            Line Height
          </span>


          <input

            type="number"

            min="0.8"

            max="3"

            step="0.1"

            value={
              style.lineHeight
            }

            onChange={(e) =>
              onChange(
                'lineHeight',
                Number(
                  e.target.value
                )
              )
            }

            style={inputStyle}

          />

        </label>

      </div>


      {/* =================================================
          ITALIC
      ================================================= */}

      <label

        style={{

          display:
            'flex',

          alignItems:
            'center',

          gap:
            '6px',

          marginTop:
            '8px',

          fontFamily:
            'monospace',

          fontSize:
            '8px',

          color:
            '#77736b',

          cursor:
            'pointer',

        }}

      >

        <input

          type="checkbox"

          checked={
            style.fontStyle ===
            'italic'
          }

          onChange={(e) =>
            onChange(
              'fontStyle',
              e.target.checked
                ? 'italic'
                : 'normal'
            )
          }

        />

        <span>
          Italic
        </span>

      </label>

    </div>

  );

}


/* =========================================================
   INSIDE OF FRONT COVER
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

    />

  );

}