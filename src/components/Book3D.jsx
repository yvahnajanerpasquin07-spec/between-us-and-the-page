import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

// Simple cover animator inspired by the 3D-Book tutorial
export default forwardRef(function Book3D(
  { coverFront, insideCover, duration = 0.72, onOpened, onClosed, mode = 'open' },
  ref
) {
  const rootRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // allow external control if needed
    startOpen: () => animateOpen(),
    startClose: () => animateClose(),
  }));

  useEffect(() => {
    // animate on mount depending on mode
    if (mode === 'open') animateOpen();
    if (mode === 'close') animateClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function animateOpen() {
    const el = rootRef.current;
    if (!el) return;
    el.style.transition = `transform ${duration}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
    el.style.transformOrigin = 'left center';
    // start from 0 -> -180deg (matching original)
    requestAnimationFrame(() => {
      el.style.transform = 'rotateY(-180deg)';
    });
    setTimeout(() => {
      if (onOpened) onOpened();
    }, duration * 1000);
  }

  function animateClose() {
    const el = rootRef.current;
    if (!el) return;
    el.style.transition = `transform ${duration}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
    el.style.transformOrigin = 'left center';
    // start from -180 -> 0
    requestAnimationFrame(() => {
      el.style.transform = 'rotateY(0deg)';
    });
    setTimeout(() => {
      if (onClosed) onClosed();
    }, duration * 1000);
  }

  return (
    <div
      className="animated-cover"
      ref={rootRef}
      style={{ transform: 'rotateY(0deg)', pointerEvents: 'none' }}
    >
      <div className="cover-front-face">{coverFront}</div>
      <div className="cover-back-face">{insideCover}</div>
    </div>
  );
});
