import { useRef, useState } from 'react';

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
    initial ?? { x: 20, y: 20, w: 220, h: 120 }
  );
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const saveTimeout = useRef(null);

  function clamp(box, container) {
    const maxX = container.width - box.w;
    const maxY = container.height - box.h;
    return {
      ...box,
      x: Math.min(Math.max(box.x, 0), Math.max(maxX, 0)),
      y: Math.min(Math.max(box.y, 0), Math.max(maxY, 0)),
      w: Math.min(box.w, container.width),
      h: Math.min(box.h, container.height),
    };
  }

  function scheduleSave(nextBox) {
    if (!onSave) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onSave(nextBox);
    }, 400);
  }

  function onDragStart(e) {
    if (!editable) return;
    e.preventDefault();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y,
    };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
  }

  function onDragMove(e) {
    if (!dragState.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setBox((prev) => {
      const next = clamp(
        { ...prev, x: dragState.current.origX + dx, y: dragState.current.origY + dy },
        { width: rect.width, height: rect.height }
      );
      return next;
    });
  }

  function onDragEnd() {
    dragState.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    setBox((current) => {
      scheduleSave(current);
      return current;
    });
  }

  function onResizeStart(e) {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: box.w,
      origH: box.h,
    };
    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', onResizeEnd);
  }

  function onResizeMove(e) {
    if (!resizeState.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - resizeState.current.startX;
    const dy = e.clientY - resizeState.current.startY;
    setBox((prev) => {
      const next = clamp(
        {
          ...prev,
          w: Math.max(MIN_W, resizeState.current.origW + dx),
          h: Math.max(MIN_H, resizeState.current.origH + dy),
        },
        { width: rect.width, height: rect.height }
      );
      return next;
    });
  }

  function onResizeEnd() {
    resizeState.current = null;
    window.removeEventListener('pointermove', onResizeMove);
    window.removeEventListener('pointerup', onResizeEnd);
    setBox((current) => {
      scheduleSave(current);
      return current;
    });
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
      }}
      className={`group ${editable ? 'cursor-move' : ''}`}
      onPointerDown={onDragStart}
    >
      <div
        className={`h-full w-full overflow-hidden rounded-md ${
          editable ? 'border-2 border-dashed border-margin/50 group-hover:border-margin' : ''
        }`}
      >
        {children}
      </div>

      {editable && (
        <div
          onPointerDown={onResizeStart}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-tl-md border-b-2 border-r-2 border-margin/70 bg-paper/80"
        />
      )}
    </div>
  );
}