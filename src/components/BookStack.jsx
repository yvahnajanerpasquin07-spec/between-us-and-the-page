import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// BookStack: implements a simple stacked paper flip inspired by the tutorial.
// Exposes methods: goNextPage(), goPrevPage(), openBook(), closeBook()
export default forwardRef(function BookStack(
  { poems = [], onFlipComplete, duration = 720 },
  ref
) {
  const rootRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(1);
  const numOfPapers = Math.max(1, poems.length);
  const maxLocation = numOfPapers + 1;

  useImperativeHandle(ref, () => ({
    goNextPage,
    goPrevPage,
    openBook,
    closeBook,
  }));

  function openBook() {
    const book = rootRef.current;
    if (!book) return;
    book.style.transform = 'translateX(50%)';
  }
  function closeBook(isAtBeginning) {
    const book = rootRef.current;
    if (!book) return;
    book.style.transform = isAtBeginning ? 'translateX(0%)' : 'translateX(100%)';
  }

  function goNextPage() {
    if (currentLocation >= maxLocation) return;
    const paperIndex = currentLocation; // 1-based
    const paper = rootRef.current?.querySelector(`#p${paperIndex}`);
    if (paper) {
      paper.classList.add('flipped');
      paper.style.zIndex = paperIndex;
    }
    const nextIndex = currentLocation - 1; // poem index to reveal
    // notify after animation
    setTimeout(() => {
      setCurrentLocation((c) => c + 1);
      if (onFlipComplete) onFlipComplete({ type: 'poem', index: nextIndex });
    }, duration);
  }

  function goPrevPage() {
    if (currentLocation <= 1) return;
    const caseIndex = currentLocation;
    // when going back, we need to unflip paper at caseIndex-1
    const paperIndex = currentLocation - 1;
    const paper = rootRef.current?.querySelector(`#p${paperIndex}`);
    if (paper) {
      // when unflipping, send the z-index back to top after animation
      paper.classList.remove('flipped');
      paper.style.zIndex = numOfPapers - paperIndex + 1;
    }
    const newIndex = currentLocation - 2; // resulting poem index
    setTimeout(() => {
      setCurrentLocation((c) => c - 1);
      if (onFlipComplete) {
        if (newIndex >= 0) onFlipComplete({ type: 'poem', index: newIndex });
        else onFlipComplete({ type: 'toc' });
      }
    }, duration);
  }

  return (
    <div className="bs-book" ref={rootRef} style={{ width: '360px', height: '480px' }}>
      {/* Render stack of papers. p1 sits on top. */}
      {Array.from({ length: numOfPapers }).map((_, i) => {
        const id = `p${i + 1}`;
        const poemIndex = i; // we'll show poem at index i on the back face when flipped
        const frontContent = (
          <div className="bs-front-content">
            {/* show previous page or placeholder */}
            {poemIndex === 0 ? <div /> : <div />}
          </div>
        );
        const backContent = (
          <div className="bs-back-content">
            {/* Render poem that will appear when this paper flips */}
            {poems[poemIndex] ? (
              <div className="page-inner poem-page">
                <div>
                  <h2>{poems[poemIndex].title || 'Untitled'}</h2>
                  {poems[poemIndex].poem_date && (
                    <p className="page-label">{poems[poemIndex].poem_date}</p>
                  )}
                </div>
                <div className="poem-text">{poems[poemIndex].content}</div>
              </div>
            ) : null}
          </div>
        );
        return (
          <div key={id} id={id} className={`bs-paper`} style={{ zIndex: numOfPapers - i }}>
            <div className="bs-front">{frontContent}</div>
            <div className="bs-back">{backContent}</div>
          </div>
        );
      })}
    </div>
  );
});
