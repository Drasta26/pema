import { EmotionalState } from './types';

// The moods offered on the home page, in plain words. Each maps to the state the
// session builder understands. Typing a few words covers anything not listed.
export const MOODS: { label: string; state: EmotionalState }[] = [
  { label: 'Anxious', state: 'Anxious / Overthinking' },
  { label: 'Stressed', state: 'Stressed / Overwhelmed' },
  { label: 'Tired', state: 'Tired / Burnout' },
  { label: 'Low', state: 'Sad / Low mood' },
  { label: 'Restless', state: 'Restless / Distracted' },
  { label: 'Angry', state: 'Angry / Irritated' },
  { label: 'Okay', state: 'Neutral / Balanced' },
  { label: 'Calm', state: 'Calm / Content' },
  { label: 'Happy', state: 'Happy / Joyful' },
];

// Short, friendly name for any stored state, e.g. "Stressed / Overwhelmed" -> "Stressed"
export function moodLabel(state?: string): string {
  if (!state) return '';
  return MOODS.find(m => m.state === state)?.label ?? state.split(' / ')[0];
}

// Moods that count as feeling settled, used to describe how a session helped
const SETTLED = new Set<string>(['Calm / Content', 'Happy / Joyful', 'Neutral / Balanced', 'Euphoric / High-Energy']);
export const isSettled = (state?: string) => !!state && SETTLED.has(state);

export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 23) return 'Good evening';
  return 'Hello, night owl';
}

// PeMA's own gentle reminders (no borrowed or uncertain quotations)
export const REMINDERS = [
  'Your breath is always with you. Come back to it any time.',
  'You do not have to fix how you feel. Just notice it.',
  'One slow breath out is a small kindness to yourself.',
  'Calm is not something you find. It is something you return to.',
  'Feelings pass like weather. You are the sky.',
  'A minute of stillness still counts.',
  'Be as gentle with yourself as you would be with a friend.',
];

// One reminder per day, so it feels fresh without moving about
export function reminderFor(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return REMINDERS[day % REMINDERS.length];
}
