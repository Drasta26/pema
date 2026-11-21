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
    r02: { t: "It sounds like you're tired.", p: 2 },
    r03: { t: "It sounds like your mind is busy.", p: 2 },
    r04: { t: "It sounds like things feel heavy right now.", p: 2 },
    r05: { t: "It sounds like you're feeling wound up.", p: 2 },
    r06: { t: "It sounds like you could use a pause.", p: 2 },
    r07: { t: "Thank you for taking a moment for yourself.", p: 2 },
    r08: { t: "It sounds like you're feeling good today.", p: 2 },
    r09: { t: "Let's take a few minutes together.", p: 2 },
    r10: { t: "There's nothing you need to fix right now.", p: 2 },
    r11: { t: "You can slow down here.", p: 2 },
    r12: { t: "Whatever you're feeling is welcome here.", p: 2 },
    r13: { t: "It sounds like you feel a little far away right now.", p: 2 },
    r14: { t: "It sounds like you have a lot of energy right now.", p: 2 },
  } },
  { label: "Purpose (choose exactly 1)", use: "purpose", lines: {
    p01: { t: "This practice helps you slow down.", p: 2 },
    p02: { t: "This practice helps you feel more settled.", p: 2 },
    p03: { t: "This practice helps you rest.", p: 2 },
    p04: { t: "This practice helps you soften and let go.", p: 2 },
    p05: { t: "This practice helps you be kind to yourself.", p: 2 },
    p06: { t: "This practice helps you cool down and step back.", p: 2 },
    p07: { t: "This practice helps you focus on one thing.", p: 2 },
    p08: { t: "This practice helps you come back to the present moment.", p: 2 },
    p09: { t: "This practice helps you enjoy what is going well.", p: 2 },
    p10: { t: "This practice helps you settle your energy.", p: 2 },
    p11: { t: "This practice helps you rest in the moment.", p: 2 },
    p12: { t: "This practice helps you notice your breath.", p: 2 },
    p13: { t: "This practice helps you feel steady and grounded.", p: 2 },
  } },
  { label: "Settling in (good for step 1)", use: "step", lines: {
    s01: { t: "Find a position that feels comfortable, sitting or lying down.", p: 3 },
    s02: { t: "Let your hands rest wherever they feel easy.", p: 3 },
    s03: { t: "Close your eyes, or rest your gaze softly on one spot.", p: 3 },
    s04: { t: "Let your shoulders drop a little.", p: 3 },
    s05: { t: "Let your jaw relax.", p: 3 },
    s06: { t: "Feel the chair, bed or floor holding you up.", p: 4 },
    s07: { t: "There's nowhere else you need to be for these few minutes.", p: 4 },
  } },
  { label: "Gentle breathing (any feeling)", use: "step", lines: {
    b01: { t: "Take a slow breath in through your nose.", p: 3 },
    b02: { t: "Breathe out slowly through your mouth.", p: 5 },
    b03: { t: "Now let your breath find its own natural rhythm.", p: 4 },
    b04: { t: "Notice the air moving in and out.", p: 5 },
    b05: { t: "Simply follow your breath for a few moments.", p: 8 },
    b06: { t: "If your mind wanders, gently bring it back to your breath.", p: 4 },
    b07: { t: "You can come back to your breath at any time.", p: 4 },
  } },
  { label: "Box breathing (anxious, overthinking)", use: "step", lines: {
    x01: { t: "Breathe in for a count of four.", p: 4 },
    x02: { t: "Hold gently for four.", p: 4 },
    x03: { t: "Breathe out for four.", p: 4 },
    x04: { t: "Pause again for four.", p: 4 },
    x05: { t: "Keep going like this, at your own pace.", p: 8 },
  } },
  { label: "Long breath out (stressed, overwhelmed)", use: "step", lines: {
    e01: { t: "Breathe in gently for four.", p: 4 },
    e02: { t: "Now breathe out slowly for six.", p: 6 },
    e03: { t: "Let each breath out be a little longer than the breath in.", p: 4 },
  } },
  { label: "Cooling breath (angry, irritated)", use: "step", lines: {
    k01: { t: "Breathe in through your nose, and out slowly through your mouth.", p: 5 },
    k02: { t: "Feel the cool air as you breathe in.", p: 4 },
    k03: { t: "Feel the warm air leaving as you breathe out.", p: 4 },
    k04: { t: "Notice any heat in your body, without doing anything about it.", p: 4 },
    k05: { t: "Let your face and hands soften as you breathe out.", p: 4 },
  } },
  { label: "Counting breaths (restless, distracted)", use: "step", lines: {
    n01: { t: "On your next breath out, count one.", p: 4 },
    n02: { t: "On the next breath out, count two.", p: 4 },
    n03: { t: "Keep counting each breath out, up to ten.", p: 8 },
    n04: { t: "If you lose count, simply start again at one.", p: 4 },
    n05: { t: "There's no need to get it right.", p: 3 },
  } },
  { label: "Grounding with the senses (anxious, numb, or when things feel too much; use g01 first if eyes are closed)", use: "step", lines: {
    g01: { t: "If your eyes are closed, gently open them.", p: 2 },
    g02: { t: "Notice five things you can see.", p: 8 },
    g03: { t: "Notice four things you can feel, like your clothes or your seat.", p: 8 },
    g04: { t: "Listen for three things you can hear.", p: 8 },
    g05: { t: "Notice two things you can smell, or just the air.", p: 6 },
    g06: { t: "Notice one thing you can taste, even if it's very faint.", p: 5 },
    g07: { t: "Feel where your body meets the chair, bed or floor.", p: 4 },
    g08: { t: "Notice that you are here, in this moment.", p: 4 },
  } },
  { label: "Body scan (stressed, tense)", use: "step", lines: {
    y01: { t: "Bring your attention to the top of your head.", p: 4 },
    y02: { t: "Notice your face, and let it soften.", p: 4 },
    y03: { t: "Move your attention to your neck and shoulders.", p: 4 },
    y04: { t: "Notice your arms, all the way to your fingertips.", p: 4 },
    y05: { t: "Notice your chest and belly rising and falling.", p: 5 },
    y06: { t: "Notice your back, and let it be supported.", p: 4 },
    y07: { t: "Move your attention down through your legs to your feet.", p: 5 },
    y08: { t: "With each breath out, let a little tension go.", p: 5 },
    y09: { t: "Notice your whole body, just as it is.", p: 5 },
  } },
  { label: "Kindness to yourself (sad, low)", use: "step", lines: {
    l01: { t: "If it feels right, place a hand on your chest.", p: 4 },
    l02: { t: "Silently say to yourself, may I be kind to myself.", p: 5 },
    l03: { t: "May I be at ease.", p: 5 },
    l04: { t: "May I be gentle with myself today.", p: 5 },
    l05: { t: "You are doing the best you can.", p: 4 },
    l06: { t: "Bring to mind someone who cares about you.", p: 5 },
    l07: { t: "Silently wish them well, in your own words.", p: 5 },
  } },
  { label: "Simple noticing (neutral, calm)", use: "step", lines: {
    o01: { t: "Notice the sounds around you, near and far.", p: 5 },
    o02: { t: "Notice any thoughts, and let them drift past.", p: 5 },
    o03: { t: "You don't need to change anything.", p: 4 },
    o04: { t: "Notice how your body feels right now.", p: 5 },
    o05: { t: "Simply watch your breath, one breath at a time.", p: 8 },
    o06: { t: "Notice the stillness between one breath and the next.", p: 5 },
  } },
  { label: "Heavy and rested (tired, burnout)", use: "step", lines: {
    t01: { t: "Let your eyelids feel heavy.", p: 4 },
    t02: { t: "Let your legs feel heavy and relaxed.", p: 4 },
    t03: { t: "Let your arms feel heavy and relaxed.", p: 4 },
    t04: { t: "Let your whole body feel heavy and supported.", p: 6 },
    t05: { t: "Rest here for a few moments.", p: 8 },
    t06: { t: "There's nothing to do but rest.", p: 6 },
  } },
  { label: "Enjoying the good (happy, joyful)", use: "step", lines: {
    j01: { t: "Think of something small that went well today.", p: 5 },
    j02: { t: "Let a small smile come to your face.", p: 4 },
    j03: { t: "Breathe in, and enjoy that good feeling.", p: 4 },
    j04: { t: "Breathe out, and let that good feeling spread.", p: 4 },
    j05: { t: "Notice something you're thankful for right now.", p: 5 },
  } },
  { label: "Settling high energy (euphoric)", use: "step", lines: {
    h01: { t: "Notice the energy moving in your body.", p: 4 },
    h02: { t: "Breathe in slowly, and feel your energy settle.", p: 4 },
    h03: { t: "Breathe out, and let your body slow down.", p: 5 },
    h04: { t: "Feel how steady the ground is beneath you.", p: 4 },
  } },
  { label: "Reconnecting with the senses (numb, disconnected)", use: "step", lines: {
    m01: { t: "Rub your hands together for a few seconds.", p: 4 },
    m02: { t: "Notice the warmth in your hands.", p: 4 },
    m03: { t: "Feel the texture of your clothes, or the surface beneath you.", p: 5 },
    m04: { t: "Wiggle your fingers and toes.", p: 3 },
    m05: { t: "Notice one small thing you can feel right now.", p: 5 },
  } },
  { label: "Closing (end of the session, choose 1 to 3)", use: "exit", lines: {
    c01: { t: "Slowly bring your attention back to the room.", p: 3 },
    c02: { t: "Gently move your fingers and toes.", p: 2 },
    c03: { t: "Take one more slow breath.", p: 3 },
    c04: { t: "When you're ready, open your eyes.", p: 2 },
    c05: { t: "Notice how you feel now.", p: 3 },
    c06: { t: "Thank you for taking this time for yourself.", p: 2 },
    c07: { t: "Carry this calm with you.", p: 2 },
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
    exit: { type: "array", items: { type: "string", enum: IDS("exit") }, description: "1 to 3 closing line ids." },
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
- If anything suggests risk of harm to the user or others, choose only the gentlest lines (reflection r01, r11 or r12, purpose p03, settling and gentle breathing, closing c06). Do not explore it. The app shows the person helpline numbers separately.`;

const LIBRARY_TEXT = GROUPS.map(g => `${g.label}\n${Object.entries(g.lines).map(([id, l]) => `${id}: ${l.t}`).join("\n")}`).join("\n\n");

const HOW = `You are a Personalised Meditation Coach. You do NOT write any spoken words. You build a session ONLY by choosing line ids from the library below. Every spoken word the person hears is one of these recorded lines, in the voice of its creator.

${SAFETY}

How to build the session:
- reflection: 1 or 2 ids that fit how the person feels.
- purpose: exactly 1 id.
- steps: 5 or 6 steps, each 1 to 3 ids in the order they are spoken. Structure: 1 settle in, 2 breathing, 3 grounding or body, 4 a quiet moment, 5 and 6 a gentle ending. Keep it calm and short; never use the same id twice in one session.\n- Grounding that uses the eyes (g02) needs g01 first if the person's eyes were closed. b07 is a good line near the end.
- exit: 1 to 3 closing ids, for example c03, c05, then c04. A gentle order: one more breath, notice how you feel, then open your eyes.
- The session lasts about 5 minutes. Set breathPacing to suit the practice (seconds per phase; type is one of box, extended, cooling, counting, gentle, none).
- Free text is allowed only in techniqueName and enhancements. Use short plain words, avoid the words journey, embrace, serenity, deep within, allow yourself, and make no medical claims.

Which lines suit which feeling:
- 'Anxious / Overthinking': box breathing (x) and grounding (g), purpose p13 or p01
- 'Stressed / Overwhelmed': body scan (y) and long breath out (e)
- 'Sad / Low mood': kindness (l) with gentle breathing (b)
- 'Angry / Irritated': cooling breath (k) and noticing (o)
- 'Restless / Distracted': counting breaths (n)
- 'Neutral / Balanced': simple noticing (o)
- 'Tired / Burnout': heavy and rested (t)
- 'Emotionally numb / Disconnected': reflection r13, reconnecting with the senses (m) and grounding (g)
- 'Happy / Joyful': enjoying the good (j)
- 'Euphoric / High-Energy': reflection r14, settling high energy (h)
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
  const exit = pick(input?.exit, "exit", 3);
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
