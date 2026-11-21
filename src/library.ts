// PeMA's library of spoken lines, recorded once in Drasta's voice and reused for every user.
// Claude only chooses and orders these lines; it never writes spoken words of its own. The relay
// (relay/worker.ts) turns the chosen ids into a session, so every word a user hears is a saved recording.
// Rules for every line: one short sentence, everyday words, calm and secular, no health claims, and none of
// the banned words (journey, embrace, serenity, deep within, allow yourself). Changing a line's wording means
// it is recorded again, so edit with care.

export interface LibLine { t: string; p: number } // text, and seconds of silence after it

export const GROUPS: { label: string; use: string; lines: Record<string, LibLine> }[] = [
  { label: "Reflection (start of the session, choose 1 or 2)", use: "reflection", lines: {
    r01: { t: "I hear you.", p: 2 },
    r02: { t: "You sound tired.", p: 2 },
    r03: { t: "It sounds like a lot is on your mind.", p: 2 },
    r04: { t: "It sounds like things feel heavy right now.", p: 2 },
    r05: { t: "It sounds like you are feeling wound up.", p: 2 },
    r06: { t: "It sounds like you could use a pause.", p: 2 },
    r07: { t: "It's good that you stopped to check in.", p: 2 },
    r08: { t: "It sounds like you're feeling good today.", p: 2 },
    r09: { t: "Let's take a few minutes together.", p: 2 },
    r10: { t: "There is nothing you need to fix right now.", p: 2 },
    r11: { t: "You can slow down here.", p: 2 },
    r12: { t: "Let's slow down together.", p: 2 },
  } },
  { label: "Purpose (choose exactly 1)", use: "purpose", lines: {
    p01: { t: "This practice helps you slow down.", p: 2 },
    p02: { t: "This practice helps you feel more settled.", p: 2 },
    p03: { t: "This practice helps you rest.", p: 2 },
    p04: { t: "This practice helps you ease tension in your body.", p: 2 },
    p05: { t: "This practice helps you be kind to yourself.", p: 2 },
    p06: { t: "This practice helps you cool down.", p: 2 },
    p07: { t: "This practice helps you focus on one thing.", p: 2 },
    p08: { t: "This practice helps you feel more connected to the moment.", p: 2 },
    p09: { t: "This practice helps you enjoy what is going well.", p: 2 },
    p10: { t: "This practice helps you bring your energy down gently.", p: 2 },
    p11: { t: "This practice helps you rest in the moment.", p: 2 },
    p12: { t: "This practice helps you notice your breath.", p: 2 },
  } },
  { label: "Settling in (good for step 1)", use: "step", lines: {
    s01: { t: "Sit or lie down in a comfortable position.", p: 2 },
    s02: { t: "Let your hands rest wherever they are comfortable.", p: 2 },
    s03: { t: "Close your eyes, or look softly at one spot.", p: 3 },
    s04: { t: "Let your shoulders drop.", p: 3 },
    s05: { t: "Unclench your jaw.", p: 3 },
    s06: { t: "Feel your body supported by the chair or bed.", p: 4 },
  } },
  { label: "Gentle breathing (any state)", use: "step", lines: {
    b01: { t: "Take a slow breath in through your nose.", p: 2 },
    b02: { t: "Breathe out slowly through your mouth.", p: 4 },
    b03: { t: "Let your breath find its own rhythm.", p: 4 },
    b04: { t: "Notice the air moving in and out.", p: 4 },
    b05: { t: "Follow your breath for a few moments.", p: 6 },
    b06: { t: "If your mind wanders, gently come back to your breath.", p: 4 },
  } },
  { label: "Box breathing (anxious, overthinking)", use: "step", lines: {
    x01: { t: "Breathe in for a count of four.", p: 1 },
    x02: { t: "Hold for four.", p: 1 },
    x03: { t: "Breathe out for four.", p: 1 },
    x04: { t: "Hold again for four.", p: 1 },
    x05: { t: "Keep going at your own pace.", p: 6 },
  } },
  { label: "Long breath out (stressed, overwhelmed)", use: "step", lines: {
    e01: { t: "Now breathe out for a count of six.", p: 2 },
    e02: { t: "Let each breath out be a little longer than the breath in.", p: 4 },
  } },
  { label: "Cooling breath (angry, irritated)", use: "step", lines: {
    k01: { t: "Breathe out slowly, as if through a straw.", p: 4 },
    k02: { t: "Feel the cool air as you breathe in.", p: 3 },
    k03: { t: "Feel the warm air as you breathe out.", p: 4 },
    k04: { t: "Notice any heat in your body.", p: 3 },
  } },
  { label: "Counting breaths (restless, distracted)", use: "step", lines: {
    n01: { t: "Count one as you breathe out.", p: 3 },
    n02: { t: "Count two on the next breath out.", p: 3 },
    n03: { t: "Keep counting each breath out, up to ten.", p: 6 },
    n04: { t: "If you lose count, start again at one.", p: 4 },
    n05: { t: "There is no need to get it right.", p: 3 },
  } },
  { label: "Grounding with the senses (anxious, numb, or any time things feel too much)", use: "step", lines: {
    g01: { t: "Look around and name five things you can see.", p: 6 },
    g02: { t: "Notice four things you can feel, like your feet on the floor.", p: 6 },
    g03: { t: "Listen for three things you can hear.", p: 6 },
    g04: { t: "Notice two things you can smell.", p: 5 },
    g05: { t: "Notice one thing you can taste.", p: 4 },
    g06: { t: "Press your feet gently into the floor.", p: 3 },
    g07: { t: "Notice that you are here, in this moment.", p: 4 },
  } },
  { label: "Body scan (stressed, tense)", use: "step", lines: {
    y01: { t: "Bring your attention to the top of your head.", p: 3 },
    y02: { t: "Notice your face and let it soften.", p: 3 },
    y03: { t: "Move your attention to your neck and shoulders.", p: 3 },
    y04: { t: "Notice your arms and hands.", p: 3 },
    y05: { t: "Notice your chest and belly rising and falling.", p: 4 },
    y06: { t: "Notice your back against the chair or bed.", p: 3 },
    y07: { t: "Move your attention down through your legs to your feet.", p: 4 },
    y08: { t: "Let any tension go as you breathe out.", p: 4 },
  } },
  { label: "Kindness to yourself (sad, low)", use: "step", lines: {
    l01: { t: "Place a hand on your chest if that feels good.", p: 3 },
    l02: { t: "Say quietly to yourself, may I be kind to myself.", p: 4 },
    l03: { t: "Say quietly, may I be at ease.", p: 4 },
    l04: { t: "You are doing the best you can today.", p: 3 },
    l05: { t: "Picture someone who cares about you.", p: 4 },
    l06: { t: "Wish them well in your own words.", p: 4 },
  } },
  { label: "Simple noticing (neutral, calm)", use: "step", lines: {
    o01: { t: "Notice what you can hear around you.", p: 4 },
    o02: { t: "Notice any thoughts, and let them pass by.", p: 4 },
    o03: { t: "You do not need to change anything.", p: 4 },
    o04: { t: "Notice how your body feels right now.", p: 4 },
    o05: { t: "Simply watch your breath, one breath at a time.", p: 6 },
  } },
  { label: "Heavy and rested (tired, burnout)", use: "step", lines: {
    t01: { t: "Let your eyes feel heavy.", p: 4 },
    t02: { t: "Let your legs feel heavy and relaxed.", p: 4 },
    t03: { t: "Let your arms feel heavy and relaxed.", p: 4 },
    t04: { t: "Let your whole body feel heavy.", p: 6 },
    t05: { t: "Rest here for a moment.", p: 6 },
  } },
  { label: "Enjoying the good (happy, joyful)", use: "step", lines: {
    j01: { t: "Think of something small that went well today.", p: 4 },
    j02: { t: "Let a small smile come to your face.", p: 4 },
    j03: { t: "Breathe in, and enjoy that feeling.", p: 3 },
    j04: { t: "Breathe out, and smile gently.", p: 4 },
  } },
  { label: "Settling high energy (euphoric)", use: "step", lines: {
    h01: { t: "Notice the energy in your body.", p: 3 },
    h02: { t: "Breathe in slowly to settle your energy.", p: 3 },
    h03: { t: "Breathe out and let your body slow down.", p: 4 },
    h04: { t: "Feel your feet on the floor.", p: 4 },
  } },
  { label: "Reconnecting with the senses (numb, disconnected)", use: "step", lines: {
    m01: { t: "Rub your hands together for a few seconds.", p: 3 },
    m02: { t: "Notice the warmth in your hands.", p: 4 },
    m03: { t: "Feel the texture of your clothes or the chair.", p: 4 },
    m04: { t: "Notice the sounds around you, near and far.", p: 4 },
  } },
  { label: "Closing (end of the session, choose 1 or 2)", use: "exit", lines: {
    c01: { t: "Slowly bring your attention back to the room.", p: 2 },
    c02: { t: "Move your fingers and toes.", p: 2 },
    c03: { t: "Take one more slow breath.", p: 2 },
    c04: { t: "When you are ready, open your eyes.", p: 2 },
    c05: { t: "Take this calm with you.", p: 2 },
    c06: { t: "Well done for taking this time.", p: 2 },
  } },
];

export const LINES: Record<string, LibLine> = Object.assign({}, ...GROUPS.map(g => g.lines));
export const IDS = (use: string) => GROUPS.filter(g => g.use === use).flatMap(g => Object.keys(g.lines));

const STATES = ["Anxious / Overthinking", "Stressed / Overwhelmed", "Sad / Low mood", "Angry / Irritated", "Restless / Distracted", "Neutral / Balanced", "Tired / Burnout", "Emotionally numb / Disconnected", "Happy / Joyful", "Euphoric / High-Energy", "Calm / Content", "Breath Meditation", "Breath Scanning Meditation"];

// The tool Claude fills in: it can only name library lines
export const LIBRARY_SCHEMA = {
  type: "object",
  properties: {
    detectedState: { type: "string", enum: STATES },
    techniqueName: { type: "string", description: "A short plain name for the practice, such as 'Box breathing and grounding'. Not spoken." },
    reflection: { type: "array", items: { type: "string", enum: IDS("reflection") }, description: "1 or 2 reflection line ids that fit how the person feels." },
    purpose: { type: "string", enum: IDS("purpose"), description: "Exactly 1 purpose line id." },
    steps: {
      type: "array",
      items: { type: "array", items: { type: "string", enum: IDS("step") }, description: "1 to 3 line ids, in the order they are spoken." },
      description: "5 or 6 steps. Step 1 settles in, then breathing, grounding or body, quiet moments, then a gentle ending.",
    },
    exit: { type: "array", items: { type: "string", enum: IDS("exit") }, description: "1 or 2 closing line ids." },
    breathPacing: {
      type: "object",
      properties: { inhale: { type: "integer" }, hold1: { type: "integer" }, exhale: { type: "integer" }, hold2: { type: "integer" }, type: { type: "string" } },
      required: ["inhale", "hold1", "exhale", "hold2", "type"],
    },
    enhancements: {
      type: "object",
      properties: {
        journalingPrompts: { type: "array", items: { type: "string" }, description: "3 simple questions to reflect on, under 12 words each. Shown as text only." },
        habitRoutine: { type: "array", items: { type: "string" }, description: "3 short daily micro-actions, under 15 words each. Text only." },
        sleepWindDown: { type: "array", items: { type: "string" }, description: "3 simple wind-down tips, under 15 words each. Text only." },
        breathworkProgression: { type: "array", items: { type: "string" }, description: "3 short progression targets, under 15 words each. Text only." },
      },
      required: ["journalingPrompts", "habitRoutine", "sleepWindDown", "breathworkProgression"],
    },
  },
  required: ["detectedState", "techniqueName", "reflection", "purpose", "steps", "exit", "breathPacing", "enhancements"],
};

const SAFETY = `SAFETY RULES (these override everything else):
- This is a relaxation and wellness tool, not healthcare. Never diagnose, never name or suggest medical or mental health conditions, never give medical, medication or treatment advice.
- Never claim the practice treats, cures or prevents any condition.
- If anything suggests risk of harm to the user or others, choose only the gentlest lines (reflection r01 or r11, purpose p03, settling and gentle breathing, closing c06). Do not explore it. The app shows the person helpline numbers separately.`;

const LIBRARY_TEXT = GROUPS.map(g => `${g.label}\n${Object.entries(g.lines).map(([id, l]) => `${id}: ${l.t}`).join("\n")}`).join("\n\n");

const HOW = `You are a Personalised Meditation Coach. You do NOT write any spoken words. You build a session ONLY by choosing line ids from the library below. Every spoken word the person hears is one of these recorded lines, in the voice of its creator.

${SAFETY}

How to build the session:
- reflection: 1 or 2 ids that fit how the person feels.
- purpose: exactly 1 id.
- steps: 5 or 6 steps, each 1 to 3 ids in the order they are spoken. Structure: 1 settle in, 2 breathing, 3 grounding or body, 4 a quiet moment, 5 and 6 a gentle ending. Keep it calm and short; never use the same id twice in one session.
- exit: 1 or 2 closing ids.
- The session lasts about 5 minutes. Set breathPacing to suit the practice (seconds per phase; type is one of box, extended, cooling, counting, gentle, none).
- Free text is allowed only in techniqueName and enhancements. Use short plain words, avoid the words journey, embrace, serenity, deep within, allow yourself, and make no medical claims.

Which lines suit which feeling:
- 'Anxious / Overthinking': box breathing (x) and grounding (g)
- 'Stressed / Overwhelmed': body scan (y) and long breath out (e)
- 'Sad / Low mood': kindness (l) with gentle breathing (b)
- 'Angry / Irritated': cooling breath (k) and noticing (o)
- 'Restless / Distracted': counting breaths (n)
- 'Neutral / Balanced': simple noticing (o)
- 'Tired / Burnout': heavy and rested (t)
- 'Emotionally numb / Disconnected': reconnecting with the senses (m) and grounding (g)
- 'Happy / Joyful': enjoying the good (j)
- 'Euphoric / High-Energy': settling high energy (h)
- 'Calm / Content': simple noticing (o)
- 'Breath Meditation': gentle breathing (b)
- 'Breath Scanning Meditation': body scan (y) with gentle breathing (b)

THE LIBRARY

${LIBRARY_TEXT}

Return the session by calling the meditation_session tool.`;

export const LIBRARY_START_SYSTEM = HOW;

export const LIBRARY_ADAPT_SYSTEM = `${HOW}

You are now adapting a session that is already under way. The person has given feedback; the request shows the current session. Choose a new set of lines in response:
- If they are distracted: fewer lines, simple breathing or counting (b or n).
- If their anxiety increased: switch to grounding at once (g, then g06 and g07), with a slow long breath out (e).
- If they feel better: fewer steps leading gently to the closing.
- If they wrote their own words: choose the lines that best meet their need, and keep it grounded.
Prioritise how the person feels over finishing the original list.`;

export interface Assembled {
  detectedState: string;
  techniqueName: string;
  stateReflection: string;
  purpose: string;
  steps: string[];
  durationText: string;
  exitInstructions: string;
  breathPacing: { inhale: number; hold1: number; exhale: number; hold2: number; type: string };
  enhancements: Record<string, string[]>;
}

const withPause = (l: LibLine) => `${l.t} [pause ${l.p}s]`;
const pick = (ids: unknown, use: string, max: number): LibLine[] => {
  const ok = new Set(IDS(use));
  return (Array.isArray(ids) ? ids : []).filter((i): i is string => typeof i === "string" && ok.has(i)).slice(0, max).map(i => LINES[i]);
};
const strings = (v: unknown, n: number) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, n).map(s => s.slice(0, 160)) : []);

// Turns the ids Claude chose into a session made only of library lines; null if it is not usable
export function assemble(input: any): Assembled | null {
  const reflection = pick(input?.reflection, "reflection", 2);
  const purpose = pick([input?.purpose], "purpose", 1)[0];
  const exit = pick(input?.exit, "exit", 2);
  const rawSteps = Array.isArray(input?.steps) ? input.steps : [];
  const seen = new Set<string>();
  const steps = rawSteps
    .map((s: unknown) => pick(s, "step", 3).filter(l => !seen.has(l.t) && !!seen.add(l.t)))
    .filter((s: LibLine[]) => s.length > 0)
    .slice(0, 6);
  if (!reflection.length || !purpose || !exit.length || steps.length < 5) return null;
  const bp = input?.breathPacing ?? {};
  const n = (v: unknown, d: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 12 ? (v as number) : d);
  const enh = input?.enhancements ?? {};
  return {
    detectedState: typeof input?.detectedState === "string" ? input.detectedState : "Neutral / Balanced",
    techniqueName: typeof input?.techniqueName === "string" && input.techniqueName.trim() ? input.techniqueName.trim().slice(0, 60) : "Guided breathing",
    stateReflection: reflection.map(withPause).join(" "),
    purpose: purpose.t,
    steps: steps.map((s: LibLine[]) => s.map(withPause).join(" ")),
    durationText: "Duration: 5 minutes",
    exitInstructions: exit.map(withPause).join(" "),
    breathPacing: { inhale: n(bp.inhale, 4), hold1: n(bp.hold1, 0), exhale: n(bp.exhale, 6), hold2: n(bp.hold2, 0), type: typeof bp.type === "string" ? bp.type : "extended" },
    enhancements: {
      journalingPrompts: strings(enh.journalingPrompts, 3),
      habitRoutine: strings(enh.habitRoutine, 3),
      sleepWindDown: strings(enh.sleepWindDown, 3),
      breathworkProgression: strings(enh.breathworkProgression, 3),
    },
  };
}
