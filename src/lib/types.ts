export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export type SoundProfile = 'beep' | 'ping' | 'synth' | 'click';

export interface AppConfig {
  duration: number;      // seconds, 30–300 step 10, default 60
  beepCount: number;     // 3–20 step 1, default 10
  minGap: number;        // seconds, 1–10 step 0.5, default 3
  soundProfile: SoundProfile;
  surpriseMode: boolean;
  visualFlash: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  duration: 60,
  beepCount: 10,
  minGap: 3,
  soundProfile: 'beep',
  surpriseMode: false,
  visualFlash: true,
};
