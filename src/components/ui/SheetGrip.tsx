import { useRef, type PointerEvent } from 'react';

export function SheetGrip({
  onUp,
  onDown,
}: {
  onUp: () => void;
  onDown: () => void;
}) {
  const startY = useRef<number | null>(null);
  const ignoreClick = useRef(false);

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (startY.current === null) return;
    const delta = event.clientY - startY.current;
    startY.current = null;
    if (Math.abs(delta) < 45) return;
    ignoreClick.current = true;
    if (delta < 0) onUp();
    else onDown();
  }

  return (
    <button
      type="button"
      className="sheetGrip"
      aria-label="シートを拡大または縮小"
      onPointerDown={(event) => {
        startY.current = event.clientY;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerUp={endDrag}
      onPointerCancel={() => { startY.current = null; }}
      onClick={() => {
        if (ignoreClick.current) {
          ignoreClick.current = false;
          return;
        }
        onUp();
      }}
    >
      <span aria-hidden="true" />
    </button>
  );
}
