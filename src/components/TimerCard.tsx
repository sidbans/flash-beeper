import { useRef, useEffect } from "react";
import type { TimerState } from "../lib/types";
import { ProgressRing } from "./ProgressRing";

interface TimerCardProps {
  state: TimerState;
  elapsedSec: number;
  duration: number;
  beepTimes: number[];
  nextBeepIdx: number;
  beepsPlayed: number;
  surpriseMode: boolean;
  /** Fires each time a beep plays — used to trigger the pulse animation */
  beepTick: number;
  showSettings: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleSettings: () => void;
}

const formatTime = (remainingSec: number): string => {
  const s = Math.max(0, remainingSec);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const STATUS_TEXT: Record<TimerState, string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  finished: "Done!",
};

const STATUS_COLOR: Record<TimerState, string> = {
  idle: "text-slate-500",
  running: "text-cyan-400",
  paused: "text-amber-400",
  finished: "text-emerald-400",
};

const TIME_COLOR: Record<TimerState, string> = {
  idle: "text-white",
  running: "text-white",
  paused: "text-white",
  finished: "text-emerald-400",
};

export const TimerCard = ({
  state,
  elapsedSec,
  duration,
  beepTimes,
  nextBeepIdx,
  beepsPlayed,
  surpriseMode,
  beepTick,
  showSettings,
  onStart,
  onPause,
  onReset,
  onToggleSettings,
}: TimerCardProps) => {
  const remaining = Math.max(0, duration - elapsedSec);
  const progress = elapsedSec / duration;

  const centerRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const prevTick = useRef(0);

  // Trigger ring-center pulse + count bump when a beep fires
  useEffect(() => {
    if (beepTick === prevTick.current) return;
    prevTick.current = beepTick;

    const center = centerRef.current;
    const count = countRef.current;
    if (center) {
      center.classList.remove("animate-ring-pulse");
      void center.offsetWidth;
      center.classList.add("animate-ring-pulse");
    }
    if (count) {
      count.classList.remove("animate-count-bump");
      void count.offsetWidth;
      count.classList.add("animate-count-bump");
    }
  }, [beepTick]);

  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isFinished = state === "finished";
  const isIdle = state === "idle";

  return (
    <section
      aria-label="Timer"
      className="glass-card flex flex-col items-center gap-8 py-8 px-6"
    >
      {/* Circular ring + center */}
      <div
        role="timer"
        aria-live="polite"
        aria-label="Time remaining"
        className="relative w-56 h-56"
      >
        <ProgressRing
          progress={progress}
          beepTimes={beepTimes}
          nextBeepIdx={nextBeepIdx}
          duration={duration}
          surpriseMode={surpriseMode}
        />

        {/* Center overlay */}
        <div
          ref={centerRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5"
        >
          <div
            className={`text-6xl font-bold tracking-tight tabular-nums leading-none transition-colors duration-200 ${TIME_COLOR[state]}`}
          >
            {formatTime(remaining)}
          </div>
          <div
            className={`text-[0.65rem] font-semibold uppercase tracking-widest transition-colors duration-200 ${STATUS_COLOR[state]}`}
          >
            {STATUS_TEXT[state]}
          </div>
          <div aria-live="polite" className="flex items-baseline gap-0.5 mt-1">
            <span
              ref={countRef}
              className="text-lg font-bold text-cyan-400 tabular-nums"
            >
              {beepsPlayed}
            </span>
            <span className="text-sm text-slate-500 tabular-nums">
              / {beepTimes.length || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        role="group"
        aria-label="Timer controls"
        className="flex gap-3 items-center flex-wrap justify-center"
      >
        {/* Start / Pause / Resume / Restart */}
        <button
          id="btn-start-pause"
          onClick={isRunning ? onPause : onStart}
          className={`btn ${isRunning ? "btn-secondary" : "btn-primary"}`}
          aria-label={
            isFinished
              ? "Restart timer"
              : isRunning
                ? "Pause timer"
                : isPaused
                  ? "Resume timer"
                  : "Start timer"
          }
        >
          <span aria-hidden="true">
            {isFinished ? "↺" : isRunning ? "⏸" : "▶"}
          </span>
          <span>
            {isFinished
              ? "Restart"
              : isRunning
                ? "Pause"
                : isPaused
                  ? "Resume"
                  : "Start"}
          </span>
        </button>

        {/* Reset */}
        <button
          id="btn-reset"
          onClick={onReset}
          disabled={isIdle}
          className="btn btn-ghost"
          aria-label="Reset timer"
        >
          <span aria-hidden="true">↺</span>
          <span>Reset</span>
        </button>

        {/* Settings toggle */}
        <button
          id="btn-settings"
          onClick={onToggleSettings}
          className={`btn btn-ghost ${showSettings ? "text-cyan-400" : ""}`}
          aria-label={showSettings ? "Hide settings" : "Show settings"}
          aria-pressed={showSettings}
        >
          <span aria-hidden="true">⚙</span>
          <span>Settings</span>
        </button>
      </div>

      {/* Legend */}
      <div aria-label="Legend" className="flex gap-5 justify-center">
        {[
          {
            dot: "w-2 h-2 bg-cyan-400/50 border border-cyan-400/80",
            label: "Pending",
          },
          {
            dot: "w-2 h-2 bg-emerald-400 border border-emerald-400",
            label: "Played",
          },
          {
            dot: "w-2 h-2 bg-white border border-white shadow-[0_0_6px_white]",
            label: "Next",
          },
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
