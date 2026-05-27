export const Header = () => {
  return (
    <header className="flex flex-col items-center gap-1 pt-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="text-3xl animate-float-icon drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]"
        >
          ⚡
        </span>
        <span className="text-4xl font-extrabold tracking-tight text-white font-display">
          Flash<span className="text-cyan-400">Beeper</span>
        </span>
      </div>
    </header>
  );
};
