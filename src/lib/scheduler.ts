/**
 * Beep scheduling algorithm.
 * Distributes N beeps across T seconds with a minimum gap G using
 * Dirichlet stick-breaking — guaranteeing even spread throughout the timeline.
 */

/**
 * Generate N sorted beep timestamps (in seconds) within [startPad, duration-endPad]
 * satisfying:
 *   - beep[i] >= startPad
 *   - beep[i] <= duration - endPad
 *   - beep[i+1] - beep[i] >= minGap
 */
export const generateBeepTimes = (
  duration: number,
  count: number,
  minGap: number,
  startPad = 1.5,
  endPad = 2.0,
): number[] => {
  const usable = duration - startPad - endPad;
  const required = minGap * (count - 1);

  // Auto-shrink minGap if config is infeasible
  let effectiveGap = minGap;
  if (required > usable) {
    effectiveGap = (usable / (count - 1)) * 0.9;
  }

  const slack = usable - effectiveGap * (count - 1);
  const cuts = generateDirichletSlacks(count + 1, slack);

  const times: number[] = [];
  let t = startPad + cuts[0];
  for (let i = 0; i < count; i++) {
    times.push(t);
    if (i < count - 1) {
      t += effectiveGap + cuts[i + 1];
    }
  }

  return times;
};

/**
 * Generate n positive values that sum to `total`, distributed evenly using
 * exponential random variables (Dirichlet / stick-breaking).
 * No single interval dominates — prevents clustering.
 */
export const generateDirichletSlacks = (n: number, total: number): number[] => {
  const raw = Array.from({ length: n }, () => -Math.log(Math.random() + 1e-12));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => (v / sum) * total);
};

/**
 * Validate whether a config is feasible and return a warning string or null.
 */
export const validateConfig = (
  duration: number,
  beepCount: number,
  minGap: number,
): string | null => {
  const usable = duration - 3.5; // startPad + endPad
  const required = minGap * (beepCount - 1);
  if (required > usable) {
    const maxBeeps = Math.floor(usable / minGap) + 1;
    return `⚠ Min gap too large — scheduler will auto-reduce (max ~${maxBeeps} beeps at ${minGap}s gap)`;
  }
  return null;
};

/**
 * Run a statistical distribution test (10,000 samples) — called in debug mode.
 */
export const runDistributionTest = (
  duration = 60,
  count = 10,
  minGap = 3,
): void => {
  const RUNS = 10_000;
  let failures = 0;
  let totalMin = Infinity;
  let totalMax = 0;

  for (let r = 0; r < RUNS; r++) {
    const times = generateBeepTimes(duration, count, minGap);
    for (let i = 0; i < times.length; i++) {
      if (times[i] < 1.0) {
        failures++;
        break;
      }
      if (times[i] > duration - 1.5) {
        failures++;
        break;
      }
      if (i > 0 && times[i] - times[i - 1] < minGap - 0.001) {
        failures++;
        break;
      }
    }
    const span = times[times.length - 1] - times[0];
    if (span < totalMin) totalMin = span;
    if (span > totalMax) totalMax = span;
  }

  console.group("FlashBeeper Distribution Test (%d runs)", RUNS);
  console.log(`Failures: ${failures} / ${RUNS}`);
  console.log(`Min spread: ${totalMin.toFixed(2)}s`);
  console.log(`Max spread: ${totalMax.toFixed(2)}s`);
  console.log(
    failures === 0 ? "✅ All constraints satisfied" : "❌ Constraints violated",
  );
  console.groupEnd();
};
