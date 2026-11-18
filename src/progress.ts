// Gentle progress from the history kept on the device: no streak pressure,
// just what the person has given themselves and what seems to help.
export interface ProgressLog {
  date: string;
  technique: string;
  state?: string;
  endState?: string;
}

const SETTLED = new Set(['Calm / Content', 'Happy / Joyful', 'Neutral / Balanced', 'Euphoric / High-Energy']);

export function minutesFor(technique: string): number {
  return technique === '60-second reset' ? 1 : 5;
}

export function summarise(logs: ProgressLog[], now: Date) {
  const weekAgo = now.getTime() - 7 * 86400000;
  const thisWeek = logs.filter(l => new Date(l.date).getTime() >= weekAgo);
  const minutes = logs.reduce((t, l) => t + minutesFor(l.technique), 0);
  const weekMinutes = thisWeek.reduce((t, l) => t + minutesFor(l.technique), 0);

  // Sessions with a before and after mood, and how many ended feeling settled
  const checked = logs.filter(l => l.state && l.endState);
  const settledAfter = checked.filter(l => SETTLED.has(l.endState!)).length;

  // The practice most often followed by feeling settled (needs at least two)
  const helped = new Map<string, number>();
  for (const l of checked) if (SETTLED.has(l.endState!)) helped.set(l.technique, (helped.get(l.technique) ?? 0) + 1);
  const best = [...helped.entries()].sort((a, b) => b[1] - a[1])[0];

  const days = new Set(logs.map(l => new Date(l.date).toDateString())).size;

  return {
    total: logs.length,
    minutes,
    weekSessions: thisWeek.length,
    weekMinutes,
    days,
    checked: checked.length,
    settledAfter,
    mostHelpful: best && best[1] >= 2 ? best[0] : undefined,
  };
}

// Kind milestones, never targets: shown once reached
export function milestone(total: number): string | undefined {
  const marks: [number, string][] = [[50, 'Fifty sessions. This is part of who you are now.'], [25, 'Twenty-five sessions of looking after yourself.'], [10, 'Ten sessions. A real habit is forming.'], [3, 'Three sessions in. You keep coming back to yourself.'], [1, 'Your first session. A lovely start.']];
  return marks.find(([n]) => total >= n)?.[1];
}
