import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import './AnchoredPopover.css';

type Align = 'start' | 'end';

export function AnchoredPopover({
  open,
  anchorRef,
  panelRef,
  children,
  className = '',
  align = 'start',
  minWidth = 168,
  maxWidth = 320,
  estimatedHeight = 220,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
  align?: Align;
  minWidth?: number;
  maxWidth?: number;
  estimatedHeight?: number;
}) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const width = Math.min(maxWidth, Math.max(minWidth, minWidth));
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < estimatedHeight + gap && spaceAbove > spaceBelow;

      const left =
        align === 'end'
          ? Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
          : Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

      const panelHeight = panelRef?.current?.offsetHeight ?? estimatedHeight;

      if (openAbove) {
        setStyle({
          position: 'fixed',
          top: Math.max(8, rect.top - gap - panelHeight),
          left,
          minWidth,
          maxWidth,
          zIndex: 10000,
        });
        return;
      }

      setStyle({
        position: 'fixed',
        top: rect.bottom + gap,
        left,
        minWidth,
        maxWidth,
        zIndex: 10000,
      });
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef, panelRef, align, minWidth, maxWidth, estimatedHeight]);

  if (!open || !style) return null;

  return createPortal(
    <div ref={panelRef} className={`anchored-popover ${className}`.trim()} style={style}>
      {children}
    </div>,
    document.body,
  );
}