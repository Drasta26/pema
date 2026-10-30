// Dr Asta's own content from The Mental SPA (youtube.com/@BeWithBreath).
// Step names come from the "5 Steps of Mental SPA" video description; the
// guidance lines are PeMA's wording, approved by the owner on 30 Oct 2026.

export interface SpaStep {
  title: string;
  guidance: string;
  seconds: number;
}

export const MENTAL_SPA_STEPS: SpaStep[] = [
  { title: 'Self-massage', guidance: 'Rub your palms together until they feel warm. Rest them over your eyes. Then gently massage your temples, jaw and shoulders.', seconds: 60 },
  { title: 'Embrace gratitude', guidance: "Bring to mind three things you're thankful for today, big or small. Let a soft smile come.", seconds: 60 },
  { title: 'Befriend your breath', guidance: 'Breathe in gently through your nose, and out a little longer. No forcing. Let the breath be your friend.', seconds: 60 },
  { title: 'Attend to the body', guidance: 'Move your attention slowly from the top of your head down to your toes. Notice each part, soften it, let it go.', seconds: 60 },
  { title: 'Embrace compassion', guidance: 'Place a hand on your heart. Silently wish: may I be at peace, may I be happy. Then wish the same for someone you care about.', seconds: 60 },
];

export interface GuidedVideo {
  id: string;
  title: string;
  duration: string;
  tag: string;
}

export const GUIDED_VIDEOS: GuidedVideo[] = [
  { id: 'xCLOWjHs-cM', title: '5 steps of Mental SPA', duration: '3:57', tag: 'Signature' },
  { id: 'qGNa4T07nWQ', title: 'Tired from work? Chill and meditate', duration: '0:51', tag: 'Tired' },
  { id: 'I64mcXJCnlw', title: 'Beginners guided meditation', duration: '15 min', tag: 'Beginners' },
  { id: 'uh7diEofybI', title: 'Beginners guided meditation', duration: '30 min', tag: 'Beginners' },
  { id: 'RSdBkMhAwMU', title: 'Beginners guided meditation', duration: '1 hour', tag: 'Deep practice' },
  { id: 'hkJk7LDytE4', title: 'OM chanting', duration: '7:47', tag: 'Calm' },
  { id: 'aPw0E6F7d7w', title: 'Buddham Sharanam Gachami chanting', duration: '6:32', tag: 'Calm' },
  { id: 'gb9KDtZ_xb4', title: 'The wishing game story', duration: '1:56', tag: 'Joy' },
  { id: 'r0uqqfPKuGI', title: 'Guided meditation for kids', duration: '5 min', tag: 'Kids' },
];
