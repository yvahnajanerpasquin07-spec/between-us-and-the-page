import { useEffect, useRef, useState } from 'react';

const MIN_W = 120;
const MIN_H = 80;


export default function DraggableWidget({
  children,
  initial,
  containerRef,
  editable = true,
  onSave,
}) {

  const [box, setBox] = useState(
    initial ?? {
      x: 20,
      y: 20,
      w: 220,
      h: 120,
    }
  );


  /*
    Controls are hidden normally.

    They appear when:
    - the mouse is hovering over the widget
    - the widget has been clicked/selected
  */
  const [
    isSelected,
    setIsSelected,
  ] = useState(false);


  const dragState =
    useRef(null);

  const resizeState =
    useRef(null);

  const saveTimeout =
    useRef(null);


  /* =========================================================
     UPDATE BOX WHEN INITIAL VALUE CHANGES
  ========================================================= */

  useEffect(() => {

    if (initial) {

      setBox(initial);

    }

  }, [initial]);


  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {

    return () => {

      if (saveTimeout.current) {

        clearTimeout(
          saveTimeout.current
        );

      }


      window.removeEventListener(
        'pointermove',
        onDragMove
      );

      window.removeEventListener(
        'pointerup',
        onDragEnd
      );

      window.removeEventListener(
        'pointermove',
        onResizeMove
      );

      window.removeEventListener(
        'pointerup',
        onResizeEnd
      );

    };

  }, []);


  /* =========================================================
     CLAMP BOX INSIDE CONTAINER
  ========================================================= */

  function clamp(box, container) {

    const maxX =
      container.width - box.w;

    const maxY =
      container.height - box.h;


    return {

      ...box,

      x: Math.min(
        Math.max(box.x, 0),
        Math.max(maxX, 0)
      ),

      y: Math.min(
        Math.max(box.y, 0),
        Math.max(maxY, 0)
      ),

      w: Math.min(
        box.w,
        container.width
      ),

      h: Math.min(
        box.h,
        container.height
      ),

    };

  }


  /* =========================================================
     SAVE WITH SMALL DELAY
  ========================================================= */

  function scheduleSave(nextBox) {

    if (!onSave) {
      return;
    }


    if (saveTimeout.current) {

      clearTimeout(
        saveTimeout.current
      );

    }


    saveTimeout.current =
      setTimeout(() => {

        onSave(nextBox);

      }, 400);

  }


  /* =========================================================
     DRAG START
  ========================================================= */

  function onDragStart(e) {

    if (!editable) {
      return;
    }


    /*
      Clicking the resize handle should NOT
      start dragging.
    */

    if (
      e.target.closest(
        '[data-resize-handle]'
      )
    ) {

      return;

    }


    /*
      Don't drag when clicking interactive
      elements inside the widget.
    */

    if (
      e.target.closest(
        'button, input, textarea, select, a'
      )
    ) {

      setIsSelected(true);

      return;

    }


    e.preventDefault();


    setIsSelected(true);


    dragState.current = {

      startX:
        e.clientX,

      startY:
        e.clientY,

      origX:
        box.x,

      origY:
        box.y,

    };


    window.addEventListener(
      'pointermove',
      onDragMove
    );

    window.addEventListener(
      'pointerup',
      onDragEnd
    );

  }


  /* =========================================================
     DRAG MOVE
  ========================================================= */

  function onDragMove(e) {

    if (
      !dragState.current ||
      !containerRef?.current
    ) {

      return;

    }


    const rect =
      containerRef.current.getBoundingClientRect();


    const dx =
      e.clientX -
      dragState.current.startX;


    const dy =
      e.clientY -
      dragState.current.startY;


    setBox((prev) => {

      const next =
        clamp(

          {

            ...prev,

            x:
              dragState.current.origX +
              dx,

            y:
              dragState.current.origY +
              dy,

          },

          {

            width:
              rect.width,

            height:
              rect.height,

          }

        );


      return next;

    });

  }


  /* =========================================================
     DRAG END
  ========================================================= */

  function onDragEnd() {

    dragState.current =
      null;


    window.removeEventListener(
      'pointermove',
      onDragMove
    );


    window.removeEventListener(
      'pointerup',
      onDragEnd
    );


    setBox((current) => {

      scheduleSave(
        current
      );


      return current;

    });

  }


  /* =========================================================
     RESIZE START
  ========================================================= */

  function onResizeStart(e) {

    if (!editable) {
      return;
    }


    e.preventDefault();

    e.stopPropagation();


    setIsSelected(true);


    resizeState.current = {

      startX:
        e.clientX,

      startY:
        e.clientY,

      origW:
        box.w,

      origH:
        box.h,

    };


    window.addEventListener(
      'pointermove',
      onResizeMove
    );

    window.addEventListener(
      'pointerup',
      onResizeEnd
    );

  }


  /* =========================================================
     RESIZE MOVE
  ========================================================= */

  function onResizeMove(e) {

    if (
      !resizeState.current ||
      !containerRef?.current
    ) {

      return;

    }


    const rect =
      containerRef.current.getBoundingClientRect();


    const dx =
      e.clientX -
      resizeState.current.startX;


    const dy =
      e.clientY -
      resizeState.current.startY;


    setBox((prev) => {

      const next =
        clamp(

          {

            ...prev,

            w: Math.max(
              MIN_W,
              resizeState.current.origW +
                dx
            ),

            h: Math.max(
              MIN_H,
              resizeState.current.origH +
                dy
            ),

          },

          {

            width:
              rect.width,

            height:
              rect.height,

          }

        );


      return next;

    });

  }


  /* =========================================================
     RESIZE END
  ========================================================= */

  function onResizeEnd() {

    resizeState.current =
      null;


    window.removeEventListener(
      'pointermove',
      onResizeMove
    );


    window.removeEventListener(
      'pointerup',
      onResizeEnd
    );


    setBox((current) => {

      scheduleSave(
        current
      );


      return current;

    });

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div

      style={{

        position:
          'absolute',

        left:
          box.x,

        top:
          box.y,

        width:
          box.w,

        height:
          box.h,

      }}

      className={`
        group
        ${editable ? 'cursor-move' : ''}
      `}

      onPointerDown={
        onDragStart
      }

      onClick={(e) => {

        if (!editable) {
          return;
        }


        /*
          Clicking anywhere on the widget
          selects it so the controls remain visible.
        */

        e.stopPropagation();

        setIsSelected(true);

      }}

    >

      {/* =====================================================
          CONTENT

          No border here.

          This keeps the actual media clean.
      ===================================================== */}

      <div
        className="
          h-full
          w-full
          overflow-hidden
          rounded-md
        "
      >

        {children}

      </div>


      {/* =====================================================
          EDITOR CONTROLS

          Only rendered for owners.

          They are invisible until the widget is
          hovered or selected.
      ===================================================== */}

      {editable && (

        <>

          {/* ===============================================
              MOVE INDICATOR
          =============================================== */}

          <div

            className={`
              pointer-events-none
              absolute
              left-1/2
              top-1
              -translate-x-1/2
              rounded-md
              bg-black/55
              px-2
              py-1
              text-white
              shadow-sm
              transition-opacity
              duration-150
              ${
                isSelected
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }
            `}

          >

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >

              <path d="M12 2v20" />

              <path d="m8 6 4-4 4 4" />

              <path d="m8 18 4 4 4-4" />

              <path d="M2 12h20" />

              <path d="m6 8-4 4 4 4" />

              <path d="m18 8 4 4-4 4" />

            </svg>

          </div>


          {/* ===============================================
              RESIZE HANDLE
          =============================================== */}

          <div

            data-resize-handle

            onPointerDown={
              onResizeStart
            }

            className={`
              absolute
              bottom-0
              right-0
              h-5
              w-5
              cursor-se-resize
              rounded-tl-md
              bg-black/55
              shadow-sm
              transition-opacity
              duration-150
              ${
                isSelected
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }
            `}

          >

            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              className="
                absolute
                bottom-1
                right-1
              "
            >

              <path d="M3 9h6" />

              <path d="M6 6h3" />

              <path d="M9 3v6" />

            </svg>

          </div>

        </>

      )}

    </div>

  );

}