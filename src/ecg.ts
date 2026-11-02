// One cardiac cycle (ms). Amplitudes are schematic; the timing is what matters.
export const CYCLE = 800, QRS = 150, T_END = 470, STIM_MS = 75;

const bump = (t: number, centre: number, width: number, height: number) =>
  height * Math.exp(-((t - centre) ** 2) / (2 * width ** 2));
export const ecg = (t: number) =>
  bump(t, 90, 22, 9) - bump(t, 142, 5, 8) + bump(t, 155, 6, 62) - bump(t, 170, 6, 13) + bump(t, 380, 42, 17);

export function ecgPath(cycles: number, width: number, baseline: number) {
  let path = '';
  const total = CYCLE * cycles;
  for (let t = 0; t <= total; t += 2) path += `${t ? 'L' : 'M'}${((t / total) * width).toFixed(1)} ${(baseline - ecg(t % CYCLE)).toFixed(1)}`;
  return path;
}
