import { useState, useCallback, useRef } from "react";
import type { AppConfig } from "./lib/types";
import { DEFAULT_CONFIG } from "./lib/types";
import { runDistributionTest } from "./lib/scheduler";
import { useTimer } from "./hooks/useTimer";
import { useAudio } from "./hooks/useAudio";
import { FlashOverlay } from "./components/FlashOverlay";
import { Header } from "./components/Header";
import { TimerCard } from "./components/TimerCard";
import { ConfigCard } from "./components/ConfigCard";
import { Timeline } from "./components/Timeline";
import { Footer } from "./components/Footer";

// Run debug test if ?debug in URL
if (typeof window !== "undefined" && window.location.search.includes("debug")) {
  runDistributionTest();
}

export const App = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [flashActive, setFlashActive] = useState(false);
  // Incrementing tick counter to trigger animations even when beep index doesn't change
  const [beepTick, setBeepTick] = useState(0);

  const audio = useAudio();
  const configRef = useRef(config);
  configRef.current = config;

  const handleBeep = useCallback(
    (idx: number) => {
      void idx;
      audio.playBeep(configRef.current.soundProfile);
      if (configRef.current.visualFlash) {
        setFlashActive(true);
      }
      setBeepTick((t) => t + 1);
    },
    [audio],
  );

  const handleFinish = useCallback(() => {
    audio.playFinish();
  }, [audio]);

  const { snapshot, start, togglePause, reset } = useTimer({
    config,
    onBeep: handleBeep,
    onFinish: handleFinish,
  });

  const handleStart = useCallback(() => {
    audio.warmUp(); // must be called from user gesture
    start();
  }, [audio, start]);

  const handleConfigChange = useCallback((patch: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const isRunning = snapshot.state === "running";
  const progress = snapshot.elapsedSec / config.duration;

  return (
    <>
      <FlashOverlay active={flashActive} onDone={() => setFlashActive(false)} />

      <div className="flex flex-col items-center min-h-svh px-4 pb-8 pt-6 max-w-135 mx-auto gap-6">
        <Header />

        <main className="flex flex-col gap-5 w-full">
          <TimerCard
            state={snapshot.state}
            elapsedSec={snapshot.elapsedSec}
            duration={config.duration}
            beepTimes={snapshot.beepTimes}
            nextBeepIdx={snapshot.nextBeepIdx}
            beepsPlayed={snapshot.beepsPlayed}
            surpriseMode={config.surpriseMode}
            beepTick={beepTick}
            onStart={handleStart}
            onPause={togglePause}
            onReset={reset}
          />

          <ConfigCard
            config={config}
            onChange={handleConfigChange}
            disabled={isRunning}
          />

          <Timeline
            progress={progress}
            beepTimes={snapshot.beepTimes}
            nextBeepIdx={snapshot.nextBeepIdx}
            duration={config.duration}
            surpriseMode={config.surpriseMode}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};
