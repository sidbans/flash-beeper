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
      {beepTimes.map((t, i) => {
        // Angle starts at 0 (3 o'clock in SVG coords), but SVG is rotated -90deg
        // so it appears at 12 o'clock, matching the progress arc start
        const angle = (t / duration) * 2 * Math.PI;
        const x = cx + RADIUS * Math.cos(angle);
        const y = cy + RADIUS * Math.sin(angle);
        const isPlayed = i < nextBeepIdx;
        const isNext = i === nextBeepIdx;
        const hide = surpriseMode && !isPlayed;

        if (hide) return null;

        // Match Timeline.tsx sizes: w-2.5 h-2.5 (5px), with scale for played/next
        const baseR = 5;
        const r = isNext ? baseR * 1.3 : isPlayed ? baseR * 0.8 : baseR;

        return (
          <circle
            key={i}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={r}
            stroke={
              isPlayed ? "#10b981" : isNext ? "#ffffff" : "rgba(6,182,212,0.8)"
            }
            strokeWidth={2}
            className={
              isPlayed
                ? "fill-emerald-400"
                : isNext
                  ? "fill-white"
                  : "fill-cyan-400/50"
            }
            style={
              isPlayed
                ? { filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
};
