import { useEffect, useRef } from "react";

interface FlashOverlayProps {
  active: boolean;
  onDone: () => void;
}

export const FlashOverlay = ({ active, onDone }: FlashOverlayProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    // Force reflow so re-triggering the animation works
    el.classList.remove("animate-full-flash");
    void el.offsetWidth;
    el.classList.add("animate-full-flash");
  }, [active]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onAnimationEnd={() => {
        ref.current?.classList.remove("animate-full-flash");
        onDone();
      }}
      className="fixed inset-0 z-[9999] pointer-events-none opacity-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.35)_0%,rgba(124,58,237,0.15)_60%,transparent_100%)]"
    />
  );
};
