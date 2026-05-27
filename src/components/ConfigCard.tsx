import type { AppConfig, SoundProfile } from "../lib/types";
import { validateConfig } from "../lib/scheduler";

interface ConfigCardProps {
  config: AppConfig;
  onChange: (patch: Partial<AppConfig>) => void;
  disabled?: boolean;
}

interface SliderRowProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}

const SliderRow = ({
  id,
  label,
  min,
  max,
  step,
  value,
  display,
  disabled,
  onChange,
}: SliderRowProps) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="grid grid-cols-2 items-center gap-3">
      <label htmlFor={id} className="text-sm font-medium text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-3 justify-end">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(+e.target.value)}
          className="slider w-36"
          style={
            { "--slider-pct": `${pct.toFixed(1)}%` } as React.CSSProperties
          }
        />
        <output
          htmlFor={id}
          className="text-sm font-semibold text-cyan-400 min-w-[38px] text-right tabular-nums"
        >
          {display}
        </output>
      </div>
    </div>
  );
};

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = ({
  id,
  label,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <label htmlFor={id} className="text-sm font-medium text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          id={id}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
            checked
              ? "bg-gradient-to-r from-violet-600 to-cyan-400 border-transparent shadow-[0_2px_12px_rgba(6,182,212,0.4)]"
              : "bg-white/10 border-white/12"
          } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs text-slate-500 w-5">
          {checked ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
};

const SOUND_OPTIONS: { value: SoundProfile; label: string }[] = [
  { value: "beep", label: "Digital Beep" },
  { value: "ping", label: "Radar Ping" },
  { value: "synth", label: "Synth Pop" },
  { value: "click", label: "Sharp Click" },
];

export const ConfigCard = ({ config, onChange, disabled }: ConfigCardProps) => {
  const warning = validateConfig(
    config.duration,
    config.beepCount,
    config.minGap,
  );

  return (
    <section aria-label="Configuration" className="glass-card px-6 py-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
        <span aria-hidden="true">⚙</span> Settings
      </h2>

      <div className="flex flex-col gap-4">
        <SliderRow
          id="cfg-duration"
          label="Duration"
          min={30}
          max={300}
          step={10}
          value={config.duration}
          display={`${config.duration}s`}
          disabled={disabled}
          onChange={(v) => onChange({ duration: v })}
        />
        <SliderRow
          id="cfg-beeps"
          label="Beep count"
          min={3}
          max={20}
          step={1}
          value={config.beepCount}
          display={String(config.beepCount)}
          disabled={disabled}
          onChange={(v) => onChange({ beepCount: v })}
        />
        <SliderRow
          id="cfg-gap"
          label="Min gap"
          min={1}
          max={10}
          step={0.5}
          value={config.minGap}
          display={`${config.minGap}s`}
          disabled={disabled}
          onChange={(v) => onChange({ minGap: v })}
        />

        {/* Sound select */}
        <div className="grid grid-cols-2 items-center gap-3">
          <label
            htmlFor="cfg-sound"
            className="text-sm font-medium text-slate-400"
          >
            Sound
          </label>
          <div className="flex justify-end">
            <select
              id="cfg-sound"
              value={config.soundProfile}
              disabled={disabled}
              onChange={(e) =>
                onChange({ soundProfile: e.target.value as SoundProfile })
              }
              className="sound-select"
              aria-label="Sound profile"
            >
              {SOUND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ToggleRow
          id="cfg-surprise"
          label="Surprise mode"
          checked={config.surpriseMode}
          onChange={(v) => onChange({ surpriseMode: v })}
        />
        <ToggleRow
          id="cfg-flash"
          label="Visual flash"
          checked={config.visualFlash}
          onChange={(v) => onChange({ visualFlash: v })}
        />
      </div>

      {warning && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 text-xs text-amber-400 text-center"
        >
          {warning}
        </p>
      )}
    </section>
  );
};
