interface ProgressRingProps {
  /** 0–1 */
  progress: number;
  beepTimes: number[];
  nextBeepIdx: number;
  duration: number;
  surpriseMode: boolean;
}

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 527.79

export const ProgressRing = ({
  progress,
  beepTimes,
  nextBeepIdx,
  duration,
  surpriseMode,
}: ProgressRingProps) => {
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  const cx = 100,
    cy = 100;

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full -rotate-90"
    >
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="ringGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={12}
      />

      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={RADIUS}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        filter="url(#ringGlow)"
        style={{ transition: "stroke-dashoffset 0.25s linear" }}
      />

      {/* Beep markers */}
      {!surpriseMode &&
        beepTimes.map((t, i) => {
          const angle = (t / duration) * 2 * Math.PI - Math.PI / 2;
          const x = cx + RADIUS * Math.cos(angle);
          const y = cy + RADIUS * Math.sin(angle);
          const isPlayed = i < nextBeepIdx;
          const isNext = i === nextBeepIdx;
          const r = isNext ? 6 : isPlayed ? 5.5 : 5;

          return (
            <circle
              key={i}
              cx={x.toFixed(2)}
              cy={y.toFixed(2)}
              r={r}
              className={
                isPlayed
                  ? "fill-emerald-400"
                  : isNext
                    ? "fill-white"
                    : "fill-cyan-400 opacity-60"
              }
              style={
                isNext
                  ? { filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))" }
                  : undefined
              }
            />
          );
        })}
    </svg>
  );
};
