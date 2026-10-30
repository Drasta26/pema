// Crisis-language safety net, shared by the app (checks before anything leaves
// the device) and the server (backstop). Rule-based on purpose: predictable,
// testable, and never delegated to the AI. Errs towards showing support; the
// support screen lets the user continue if it was a false alarm.

// UK signposting. Owner to re-verify numbers before each public release.
export const UK_SUPPORT = [
  { name: 'Emergency', detail: 'If you or someone else is in immediate danger', contact: '999', href: 'tel:999' },
  { name: 'NHS', detail: 'Urgent mental health help, 24 hours (in England, choose the mental health option)', contact: '111', href: 'tel:111' },
  { name: 'Samaritans', detail: 'Free, 24 hours, any reason', contact: '116 123', href: 'tel:116123' },
  { name: 'Shout', detail: 'Free, 24-hour text support', contact: 'Text SHOUT to 85258', href: 'sms:85258?&body=SHOUT' },
] as const;

const CRISIS_PATTERNS: RegExp[] = [
  // Suicidal thoughts
  /\b(kill|killing|end|ending|take|taking)\s+(my\s*self|myself|my\s+(own\s+)?life)\b/,
  /\bsuicid(e|al)\b/,
  /\b(want|wanna|wish|going|ready|plan(ning)?)\s+(to\s+)?die\b/,
  /\bwish\s+i\s+(was|were)\s+dead\b/,
  /\bbetter\s+off\s+(dead|without\s+me)\b/,
  /\b(no|not\s+any)\s+(reason|point)\s+(to|in)\s+(live|living|going\s+on|be\s+alive|being\s+alive)\b/,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(live|be\s+alive|be\s+here\s+anymore|wake\s+up)\b/,
  /\bcan'?t\s+go\s+on\b/,
  /\bend\s+it\s+all\b/,
  /\bunalive\b/,
  // Self-harm and overdose
  /\bself[\s-]?harm(ing)?\b/,
  /\b(hurt|hurting|harm|harming|cut|cutting|burn|burning)\s+(my\s*self|myself)\b/,
  /\bover\s?dos(e|ed|ing)\b/,
  // Harm to others
  /\b(kill|hurt|harm)\s+(him|her|them|someone|somebody|my\s+\w+)\b/,
  // Immediate danger or abuse
  /\b(being|been|getting)\s+(abused|hit|beaten|attacked)\b/,
  /\b(not|don'?t)\s+feel\s+safe\b/,
  /\bin\s+danger\b/,
];

export function detectCrisis(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalised = text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
  return CRISIS_PATTERNS.some(p => p.test(normalised));
}
