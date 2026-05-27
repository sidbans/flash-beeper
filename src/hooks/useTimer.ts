import { useState, useRef, useCallback, useEffect } from "react";
import type { TimerState, AppConfig } from "../lib/types";
import { generateBeepTimes } from "../lib/scheduler";

export interface TimerSnapshot {
  state: TimerState;
  elapsedSec: number;
  beepTimes: number[];
  nextBeepIdx: number;
  beepsPlayed: number;
}

interface UseTimerOptions {
  config: AppConfig;
  onBeep: (idx: number) => void;
  onFinish: () => void;
}

export const useTimer = ({ config, onBeep, onFinish }: UseTimerOptions) => {
  const [snapshot, setSnapshot] = useState<TimerSnapshot>({
    state: "idle",
    elapsedSec: 0,
    beepTimes: [],
    nextBeepIdx: 0,
    beepsPlayed: 0,
  });

  // Mutable refs for the rAF loop (avoid stale closures)
  const stateRef = useRef<TimerState>("idle");
  const startTimeRef = useRef<number>(0); // performance.now() anchor
  const elapsedMsRef = useRef<number>(0); // total ms elapsed
  const beepTimesRef = useRef<number[]>([]);
  const nextBeepRef = useRef<number>(0);
  const beepsPlayedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Keep config accessible inside the tick loop without re-creating it
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Callbacks accessible inside tick loop
  const onBeepRef = useRef(onBeep);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onBeepRef.current = onBeep;
  }, [onBeep]);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Publish a snapshot to React state
  const publish = useCallback(() => {
    setSnapshot({
      state: stateRef.current,
      elapsedSec: elapsedMsRef.current / 1000,
      beepTimes: [...beepTimesRef.current],
      nextBeepIdx: nextBeepRef.current,
      beepsPlayed: beepsPlayedRef.current,
    });
  }, []);

  // ── rAF tick loop ───────────────────────────────────────────
  const tick = useCallback(() => {
    if (stateRef.current !== "running") return;

    elapsedMsRef.current = performance.now() - startTimeRef.current;
    const elapsedSec = elapsedMsRef.current / 1000;
    const { duration } = configRef.current;

    // Fire due beeps
    while (
      nextBeepRef.current < beepTimesRef.current.length &&
      elapsedSec >= beepTimesRef.current[nextBeepRef.current]
    ) {
      onBeepRef.current(nextBeepRef.current);
      beepsPlayedRef.current++;
      nextBeepRef.current++;
    }

    // Finished?
    if (elapsedSec >= duration) {
      elapsedMsRef.current = duration * 1000;
      stateRef.current = "finished";
      publish();
      onFinishRef.current();
      return;
    }

    publish();
    rafRef.current = requestAnimationFrame(tick);
  }, [publish]);

  // ── Controls ────────────────────────────────────────────────
  const start = useCallback(() => {
    if (stateRef.current === "running") return;

    const isResume = stateRef.current === "paused";

    if (!isResume) {
      // Fresh start (or restart from finished/idle)
      beepTimesRef.current = generateBeepTimes(
        config.duration,
        config.beepCount,
        config.minGap,
      );
      nextBeepRef.current = 0;
      beepsPlayedRef.current = 0;
      elapsedMsRef.current = 0;
    }

    startTimeRef.current = performance.now() - elapsedMsRef.current;
    stateRef.current = "running";
    publish();
    rafRef.current = requestAnimationFrame(tick);
  }, [config, tick, publish]);

  const togglePause = useCallback(() => {
    if (stateRef.current === "running") {
      stateRef.current = "paused";
      elapsedMsRef.current = performance.now() - startTimeRef.current;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      publish();
    } else if (stateRef.current === "paused") {
      startTimeRef.current = performance.now() - elapsedMsRef.current;
      stateRef.current = "running";
      publish();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick, publish]);

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stateRef.current = "idle";
    elapsedMsRef.current = 0;
    nextBeepRef.current = 0;
    beepsPlayedRef.current = 0;
    beepTimesRef.current = [];
    publish();
  }, [publish]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return { snapshot, start, togglePause, reset };
};
