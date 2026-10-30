export type EmotionalState =
  | 'Anxious / Overthinking'
  | 'Stressed / Overwhelmed'
  | 'Sad / Low mood'
  | 'Angry / Irritated'
  | 'Restless / Distracted'
  | 'Neutral / Balanced'
  | 'Tired / Burnout'
  | 'Happy / Joyful'
  | 'Euphoric / High-Energy'
  | 'Calm / Content'
  | 'Emotionally numb / Disconnected'
  | 'Breath Meditation'
  | 'Breath Scanning Meditation';

export type FeedbackType = 'distracted' | 'anxiety_increased' | 'feeling_better' | 'freeform';

export interface BreathPacing {
  inhale: number; // seconds
  hold1: number;  // seconds
  exhale: number; // seconds
  hold2: number;  // seconds
  type: 'box' | 'extended' | 'cooling' | 'counting' | 'gentle' | 'none';
}

export interface MeditationSession {
  id: string;
  state: EmotionalState;
  techniqueName: string;
  stateReflection: string;
  purpose: string;
  steps: string[];
  durationText: string;
  breathPacing: BreathPacing;
  exitInstructions: string;
  // Metadata for optional enhancements
  enhancements?: {
    journalingPrompts: string[];
    habitRoutine: string[];
    sleepWindDown: string[];
    breathworkProgression: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
