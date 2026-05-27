interface TimelineProps {
  progress: number; // 0–1
  beepTimes: number[];
  nextBeepIdx: number;
  duration: number;
  surpriseMode: boolean;
}

export const Timeline = ({
  progress,
  beepTimes,
  nextBeepIdx,
  duration,
  surpriseMode,
}: TimelineProps) => {
  const pct = `${(Math.min(1, Math.max(0, progress)) * 100).toFixed(2)}%`;
  const midLabel = `${Math.round(duration / 2)}s`;
  const endLabel = `${duration}s`;

  return (
    <section aria-label="Beep timeline" className="glass-card px-6 py-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
        <span aria-hidden="true">▬</span> Timeline
      </h2>

      {/* Track */}
      <div className="mb-3">
        <div className="relative h-2.5 rounded-full bg-white/6 my-3 overflow-visible">
          {/* Progress fill */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-[width] duration-[250ms] linear"
            style={{ width: pct }}
          />

          {/* Playhead dot */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_0_3px_rgba(6,182,212,0.5),0_0_12px_rgba(6,182,212,0.6)] transition-[left] duration-[250ms] linear z-10"
            style={{ left: pct }}
          />

          {/* Beep marker dots */}
          <div
            role="list"
            aria-label="Beep markers"
            className="absolute inset-0"
          >
            {beepTimes.map((t, i) => {
              const left = `${((t / duration) * 100).toFixed(2)}%`;
              const isPlayed = i < nextBeepIdx;
              const isNext = i === nextBeepIdx;
              const hide = surpriseMode && !isPlayed;

              return (
                <div
                  key={i}
                  role="listitem"
                  aria-label={`Beep ${i + 1} at ${t.toFixed(1)}s`}
                  className={[
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 z-[1]",
                    isPlayed
                      ? "bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] scale-[0.8]"
                      : isNext
                        ? "bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.8)] scale-[1.3] z-[3]"
                        : "bg-cyan-400/50 border-cyan-400/80",
                    hide ? "opacity-0 pointer-events-none" : "",
                  ].join(" ")}
                  style={{ left }}
                />
              );
            })}
          </div>
        </div>

        {/* Labels */}
        <div
          aria-hidden="true"
          className="flex justify-between text-xs text-slate-500 tabular-nums"
        >
          <span>0s</span>
          <span>{midLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      {/* Legend */}
      <div aria-label="Legend" className="flex gap-5 justify-center mt-3">
        {[
          {
            dot: "w-2 h-2 bg-cyan-400/60 border border-cyan-400/80",
            label: "Pending",
          },
          { dot: "w-2 h-2 bg-emerald-400", label: "Played" },
          { dot: "w-2 h-2 bg-white shadow-[0_0_6px_white]", label: "Next" },
        ].map(({ dot, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-xs text-slate-500"
          >
            <span
              aria-hidden="true"
              className={`inline-block rounded-full ${dot}`}
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};
