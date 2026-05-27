import { useRef, useCallback } from "react";
import { AudioSynth } from "../lib/audioSynth";
import type { SoundProfile } from "../lib/types";

/**
 * React hook that wraps AudioSynth in a stable ref.
 * The AudioSynth instance is created once and reused across renders.
 */
export const useAudio = () => {
  const synthRef = useRef<AudioSynth | null>(null);

  const getSynth = (): AudioSynth => {
    if (!synthRef.current) {
      synthRef.current = new AudioSynth();
    }
    return synthRef.current;
  };

  /** Warm up the AudioContext (must be called from a user gesture). */
  const warmUp = useCallback(() => {
    getSynth().getCtx();
  }, []);

  const playBeep = useCallback((profile: SoundProfile) => {
    getSynth().playBeep(profile);
  }, []);

  const playFinish = useCallback(() => {
    getSynth().playFinish();
  }, []);

  return { warmUp, playBeep, playFinish };
};
