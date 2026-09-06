import {
  useEffect,
  useRef,
  useState,
} from 'react';

const MIN_W = 120;
const MIN_H = 80;


/* =========================================================
   DRAGGABLE WIDGET
========================================================= */

export default function DraggableWidget({
  children,
  initial,
  containerRef,
  editable = true,
  onSave,
}) {

  const [
    box,
    setBox,
  ] = useState(
    initial ?? {
      x: 20,
      y: 20,
      w: 220,
      h: 120,
    }
  );


  /*
    Keep the latest box available to pointer handlers.

    This prevents mobile pointer events from working
    with an outdated state value.
  */

  const boxRef =
    useRef(box);


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
     KEEP BOX REF IN SYNC
  ========================================================= */

  useEffect(() => {

    boxRef.current =
      box;

  }, [
    box,
  ]);


  /* =========================================================
     UPDATE BOX WHEN INITIAL VALUE CHANGES
  ========================================================= */

  useEffect(() => {

    if (!initial) {
      return;
    }


    setBox((current) => {

      const next = {
        ...current,
        ...initial,
      };


      const same =
        current.x === next.x &&
        current.y === next.y &&
        current.w === next.w &&
        current.h === next.h;


      if (same) {
        return current;
      }


      boxRef.current =
        next;


      return next;

    });

  }, [
    initial?.x,
    initial?.y,
    initial?.w,
    initial?.h,
    initial?.url,
  ]);


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

    };

  }, []);


  /* =========================================================
     CLAMP BOX INSIDE CONTAINER
  ========================================================= */

  function clamp(
    nextBox,
    container
  ) {

    const maxX =
      Math.max(
        container.width -
          nextBox.w,
        0
      );


    const maxY =
      Math.max(
        container.height -
          nextBox.h,
        0
      );


    return {

      ...nextBox,

      x: Math.min(
        Math.max(
          nextBox.x,
          0
        ),
        maxX
      ),

      y: Math.min(
        Math.max(
          nextBox.y,
          0
        ),
        maxY
      ),

      w: Math.min(
        Math.max(
          nextBox.w,
          MIN_W
        ),
        container.width
      ),

      h: Math.min(
        Math.max(
          nextBox.h,
          MIN_H
        ),
        container.height
      ),

    };

  }


  /* =========================================================
     SAVE
  ========================================================= */

  function scheduleSave(
    nextBox
  ) {

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

        onSave(
          nextBox
        );

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
      Only the move handle starts dragging.

      Do not allow this event to become a normal
      browser touch/scroll gesture.
    */

    e.preventDefault();

    e.stopPropagation();


    setIsSelected(
      true
    );


    const currentBox =
      boxRef.current;


    dragState.current = {

      pointerId:
        e.pointerId,

      startX:
        e.clientX,

      startY:
        e.clientY,

      origX:
        currentBox.x,

      origY:
        currentBox.y,

    };


    /*
      Pointer capture is important on mobile.

      Once the finger starts moving, the handle
      continues receiving the pointer events even
      if the finger moves outside the icon.
    */

    try {

      e.currentTarget.setPointerCapture(
        e.pointerId
      );

    } catch {
      // Ignore pointer capture errors.
    }

  }


  /* =========================================================
     DRAG MOVE
  ========================================================= */

  function onDragMove(e) {

    const drag =
      dragState.current;


    if (
      !drag ||
      drag.pointerId !==
        e.pointerId ||
      !containerRef?.current
    ) {

      return;

    }


    /*
      Prevent normal scrolling while the
      move handle is actively being dragged.
    */

    if (
      e.cancelable
    ) {

      e.preventDefault();

    }


    const rect =
      containerRef.current
        .getBoundingClientRect();


    const dx =
      e.clientX -
      drag.startX;


    const dy =
      e.clientY -
      drag.startY;


    const currentBox =
      boxRef.current;


    const next =
      clamp(

        {

          ...currentBox,

          x:
            drag.origX +
            dx,

          y:
            drag.origY +
            dy,

        },

        {

          width:
            rect.width,

          height:
            rect.height,

        }

      );


    boxRef.current =
      next;


    setBox(
      next
    );

  }


  /* =========================================================
     DRAG END
  ========================================================= */

  function onDragEnd(e) {

    const drag =
      dragState.current;


    if (
      !drag ||
      drag.pointerId !==
        e.pointerId
    ) {

      return;

    }


    dragState.current =
      null;


    /*
      Release pointer capture.
    */

    try {

      e.currentTarget.releasePointerCapture(
        e.pointerId
      );

    } catch {
      // Ignore pointer capture errors.
    }


    /*
      Save the actual latest position.
    */

    scheduleSave(
      boxRef.current
    );

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


    setIsSelected(
      true
    );


    const currentBox =
      boxRef.current;


    resizeState.current = {

      pointerId:
        e.pointerId,

      startX:
        e.clientX,

      startY:
        e.clientY,

      origW:
        currentBox.w,

      origH:
        currentBox.h,

    };


    /*
      Keep receiving pointer events even when
      the finger moves outside the resize handle.
    */

    try {

      e.currentTarget.setPointerCapture(
        e.pointerId
      );

    } catch {
      // Ignore pointer capture errors.
    }

  }


  /* =========================================================
     RESIZE MOVE
  ========================================================= */

  function onResizeMove(e) {

    const resize =
      resizeState.current;


    if (
      !resize ||
      resize.pointerId !==
        e.pointerId ||
      !containerRef?.current
    ) {

      return;

    }


    /*
      Prevent normal scrolling while
      the resize handle is active.
    */

    if (
      e.cancelable
    ) {

      e.preventDefault();

    }


    const rect =
      containerRef.current
        .getBoundingClientRect();


    const dx =
      e.clientX -
      resize.startX;


    const dy =
      e.clientY -
      resize.startY;


    const currentBox =
      boxRef.current;


    const next =
      clamp(

        {

          ...currentBox,

          w: Math.max(
            MIN_W,
            resize.origW +
              dx
          ),

          h: Math.max(
            MIN_H,
            resize.origH +
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


    boxRef.current =
      next;


    setBox(
      next
    );

  }


  /* =========================================================
     RESIZE END
  ========================================================= */

  function onResizeEnd(e) {

    const resize =
      resizeState.current;


    if (
      !resize ||
      resize.pointerId !==
        e.pointerId
    ) {

      return;

    }


    resizeState.current =
      null;


    /*
      Release pointer capture.
    */

    try {

      e.currentTarget.releasePointerCapture(
        e.pointerId
      );

    } catch {
      // Ignore pointer capture errors.
    }


    /*
      Save the actual latest size.
    */

    scheduleSave(
      boxRef.current
    );

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

      className="
        group
      "

      onClick={(e) => {

        if (!editable) {
          return;
        }


        /*
          Clicking the widget selects it,
          but does NOT start dragging.
        */

        e.stopPropagation();


        setIsSelected(
          true
        );

      }}

    >

      {/* =====================================================
          CONTENT

          Nothing covers the content.

          Spotify, images, links, buttons, etc.
          remain interactive.
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
      ===================================================== */}

      {editable && (

        <>

          {/* ===============================================
              MOVE HANDLE

              44x44px touch target.

              touchAction: none is applied ONLY here.

              This means:
              - dragging this handle = widget moves
              - page does not scroll
              - touching the rest of the page = normal scroll
          =============================================== */}

          <div

            className={`
              pointer-events-auto
              absolute
              left-1/2
              top-0
              z-20
              flex
              h-11
              w-11
              -translate-x-1/2
              items-center
              justify-center
              rounded-md
              bg-black/55
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

            onPointerDown={
              onDragStart
            }

            onPointerMove={
              onDragMove
            }

            onPointerUp={
              onDragEnd
            }

            onPointerCancel={
              onDragEnd
            }

            style={{
              touchAction:
                'none',

              userSelect:
                'none',

              WebkitUserSelect:
                'none',

              WebkitTouchCallout:
                'none',

            }}

          >

            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              pointerEvents="none"
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

              44x44px touch target.

              touchAction: none is applied ONLY here.
          =============================================== */}

          <div

            data-resize-handle

            onPointerDown={
              onResizeStart
            }

            onPointerMove={
              onResizeMove
            }

            onPointerUp={
              onResizeEnd
            }

            onPointerCancel={
              onResizeEnd
            }

            className={`
              absolute
              bottom-0
              right-0
              z-20
              flex
              h-11
              w-11
              cursor-se-resize
              items-end
              justify-end
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

            style={{
              touchAction:
                'none',

              userSelect:
                'none',

              WebkitUserSelect:
                'none',

              WebkitTouchCallout:
                'none',

            }}

          >

            <svg
              width="15"
              height="15"
              viewBox="0 0 12 12"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              pointerEvents="none"
              className="
                mb-2
                mr-2
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