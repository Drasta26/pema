import Anthropic from "@anthropic-ai/sdk";
import { EmotionalState, MeditationSession, BreathPacing, FeedbackType } from "../src/types";

// Claude client. Key presence is checked per request so startup never crashes.
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const hasClaudeKey = () => !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY";
let _client: Anthropic | null = null;
const claude = () => (_client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

// Ask Claude for a session object; tool use forces output to match MEDITATION_SCHEMA.
async function callClaude(system: string, userQuery: string): Promise<any> {
  const msg = await claude().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system,
    tools: [{ name: "meditation_session", description: "Return the meditation session.", input_schema: MEDITATION_SCHEMA as any }],
    tool_choice: { type: "tool", name: "meditation_session" },
    messages: [{ role: "user", content: userQuery }],
  });
  const block = msg.content.find((b: any) => b.type === "tool_use") as any;
  return block?.input ?? {};
}

// Guide layout configuration for prompt mapping
const STATE_MAPPINGS: Record<string, { technique: string; focus: string; pacing: BreathPacing }> = {
  'Anxious / Overthinking': {
    technique: 'Box Breathing + Grounding (5-4-3-2-1 method)',
    focus: 'Slowing down mental spin with box-breathing counting and spatial anchoring.',
    pacing: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, type: 'box' }
  },
  'Stressed / Overwhelmed': {
    technique: 'Body Scan + Extended Exhale Breathing',
    focus: 'Releasing physiological stress responses by extending exhalations and systematic muscle scanning.',
    pacing: { inhale: 4, hold1: 0, exhale: 6, hold2: 0, type: 'extended' }
  },
  'Sad / Low mood': {
    technique: 'Self-compassion Loving-Kindness Light Meditation',
    focus: 'Building warm self-connection, softening emotional constriction, gentle loving phrases.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'gentle' }
  },
  'Angry / Irritated': {
    technique: 'Cooling Breath + Body Sensation Observation',
    focus: 'Disarming thermal emotional rushes with sitali/cooling breath and non-reactive physical witness.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'cooling' }
  },
  'Restless / Distracted': {
    technique: 'Focused Attention Breath Counting resetting loop',
    focus: 'Anchoring attention by counting cycles from 1 to 10. Resets if distracted.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'counting' }
  },
  'Neutral / Balanced': {
    technique: 'Insight Meditation (Vipassana-style Observation)',
    focus: 'Sustained witnessing of physical and mental phenomena as they arise and pass away.',
    pacing: { inhale: 5, hold1: 0, exhale: 5, hold2: 0, type: 'gentle' }
  },
  'Tired / Burnout': {
    technique: 'Yoga Nidra Micro-relaxation',
    focus: 'Inducing deeper parasympathetic restoration through systematic systemic awareness of body parts.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'none' }
  },
  'Emotionally numb / Disconnected': {
    technique: 'Sensory Reconnection + Gentle Physical Grounding',
    focus: 'Attuning to subtle physical contact points, returning attention to direct somatosensory experience.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'gentle' }
  },
  'Happy / Joyful': {
    technique: 'Joy Expansion & Radiant Loving-Kindness',
    focus: 'Absorbing positive feeling states, relaxing facial muscles, reflecting inner light.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'gentle' }
  },
  'Euphoric / High-Energy': {
    technique: 'Somatic grounding & Harmonic Ocean Breath',
    focus: 'Centering and balancing high emotional vibrations into physical pathways.',
    pacing: { inhale: 4, hold1: 2, exhale: 4, hold2: 2, type: 'box' }
  },
  'Calm / Content': {
    technique: 'Spacious Awareness Resting Practice',
    focus: 'Appreciating present peace, resting in stillness without seeking anything different.',
    pacing: { inhale: 5, hold1: 0, exhale: 5, hold2: 0, type: 'gentle' }
  },
  'Breath Meditation': {
    technique: 'Anapana Samatha Breath Mindfulness',
    focus: 'Slowing mental activity by observing sensory friction at the rim of the nostrils.',
    pacing: { inhale: 4, hold1: 0, exhale: 4, hold2: 0, type: 'gentle' }
  },
  'Breath Scanning Meditation': {
    technique: 'Somatic Breath Scanning Awareness',
    focus: 'Tracing respiratory waves consecutively throughout physical body sectors to dissolve somatic tension.',
    pacing: { inhale: 5, hold1: 0, exhale: 5, hold2: 0, type: 'gentle' }
  }
};

// Global Cloudflare CDN style cache database mapping to hold techniques and prevent API cost accumulation
const cloudflareCdnCache = new Map<string, any>();

function getLocalEnhancements(state: EmotionalState) {
  return {
    journalingPrompts: [
      "What is one physical sensation I can feel right now?",
      "Write down two things that are completely outside your control today.",
      "How does my body feel after taking these few silent breath cycles?"
    ],
    habitRoutine: [
      "Take 3 extended-exhale breaths before checking your morning email.",
      "Keep a glass of water on your desk as a physical mindfulness trigger.",
      "Step away from screens for 2 minutes during afternoon transitions."
    ],
    sleepWindDown: [
      "Dim all overhead lights 45 minutes before bedtime.",
      "Write tomorrow's to-do list down to empty your mental workspace.",
      "Perform a gentle, 2-minute progressive muscle release in bed."
    ],
    breathworkProgression: [
      "Practice 4-4-4-4 box breathing for 2 minutes daily this week.",
      "Extend your exhalations by 1 second during your next midday pause.",
      "Observe three natural, non-directed breaths when waking up tomorrow."
    ]
  };
}

function generateLocalMockSession(state: EmotionalState): MeditationSession {
  const meta = STATE_MAPPINGS[state] || STATE_MAPPINGS['Neutral / Balanced'];
  
  let reflection = `Ready to support you right now. [pause 2s] Let us take this moment.`;
  let purpose = `This practice helps you return to standard balance.`;
  let steps: string[] = [];
  let exit = `Slowly return. [pause 2s] Open your eyes.`;

  switch(state) {
    case 'Anxious / Overthinking':
      reflection = `I hear that your mind is racing right now. [pause 2s] Let us ground ourselves.`;
      purpose = `This practice helps you slow down mental spin.`;
      steps = [
        "Gently sit upright and feel your feet flat on the floor. [pause 3s]",
        "Inhale for four seconds. [pause 2s] Hold. [pause 2s] Exhale for four seconds. [pause 2s] Hold.",
        "Quietly observe the support of your chair holding you. [pause 4s]",
        "Focus on one single steady object in your room. [pause 3s]",
        "Continue the box breathing: Inhale... hold... exhale... hold. [pause 4s]",
        "Inhale safety... and exhale the nervous energy. [pause 3s]"
      ];
      break;
    case 'Stressed / Overwhelmed':
      reflection = `I notice the heavy pressure you are carrying. [pause 2s] Let us release this stress.`;
      purpose = `This practice helps you release physiological stress.`;
      steps = [
        "Let your shoulders drop and unclench your jaw completely. [pause 3s]",
        "Inhale slowly for four seconds... and sigh it out for six seconds. [pause 4s]",
        "Direct your breath down into any tension in your chest. [pause 4s]",
        "Notice the physical touch points of your seat and support. [pause 3s]",
        "Continue the long, smooth exhalations... letting stress dissolve. [pause 4s]",
        "Rest here in this spacious, non-demanding presence. [pause 3s]"
      ];
      break;
    case 'Sad / Low mood':
      reflection = `I feel the gentleness of your heavy heart right now. [pause 2s] Be gentle with yourself.`;
      purpose = `This practice helps you build warm self-compassion.`;
      steps = [
        "Place one hand over your heart or on your belly, feeling warmth. [pause 3s]",
        "Breathe in a gentle, caring rhythm that feels soothing. [pause 3s]",
        "Whisper silently: 'May I be kind to myself in this moment.' [pause 4s]",
        "Allow whatever feelings are here to just arise without judgment. [pause 4s]",
        "Feel the gentle rise and fall of your hand on your chest. [pause 3s]",
        "Rest in this quiet cradle of warm, safe self-acceptance. [pause 4s]"
      ];
      break;
    case 'Angry / Irritated':
      reflection = `I hear the direct heat of irritation. [pause 2s] Let us find a cool center.`;
      purpose = `This practice helps you disarm thermal emotional rushes.`;
      steps = [
        "Roll your tongue or part your lips to inhale a cool sip of air. [pause 3s]",
        "Exhale slowly through the nose, feeling the warm discharge. [pause 4s]",
        "Observe the physical location of anger in the body as simple heat. [pause 4s]",
        "You do not need to fight this feeling... just witness it. [pause 3s]",
        "Inhale cool air... exhale warm, letting the heat flow out. [pause 4s]",
        "Let the muscles around your eyes and temples soften completely. [pause 4s]"
      ];
      break;
    case 'Restless / Distracted':
      reflection = `I hear how fragmented your attention feels. [pause 2s] Let us anchor your focus.`;
      purpose = `This practice helps you anchor attention to a simple baseline.`;
      steps = [
        "Bring your focus entirely to the entrance of your nostrils. [pause 3s]",
        "As you finish an exhalation, quietly count: one. [pause 3s]",
        "Next exhalation: count two. [pause 3s] Go on up to ten.",
        "If a thought pulls you away, gently start again at one. [pause 4s]",
        "No judgment or frustration... simply return to one. [pause 4s]",
        "Allow each cycle of breath to be your complete world. [pause 3s]"
      ];
      break;
    case 'Tired / Burnout':
      reflection = `I notice how exhausted you feel. [pause 2s] This is a space of pure rest.`;
      purpose = `This practice helps you induce deeper parasympathetic restoration.`;
      steps = [
        "Lie down or lean back comfortably, supporting your entire body. [pause 3s]",
        "Send a wave of relaxation from your eyes down to your toes. [pause 4s]",
        "Feel your bones grow heavy as you sink into complete rest. [pause 4s]",
        "Let go of any need to do anything or achieve anything right now. [pause 4s]",
        "Observe the quiet, effortless flow of your natural breath. [pause 4s]",
        "Rest in this absolute resting state. [pause 4s]"
      ];
      break;
    case 'Emotionally numb / Disconnected':
      reflection = `I hear that things feel heavy and distant. [pause 2s] Let us return to touch.`;
      purpose = `This practice helps you return to somatosensory experience.`;
      steps = [
        "Inhale fully, and feel the solid pressure of your seat. [pause 3s]",
        "Gently press your index finger and thumb together with solid friction. [pause 3s]",
        "Feel the subtle texture, temperature, and warmth of your skin. [pause 4s]",
        "Let your attention rest completely in this simple contact point. [pause 4s]",
        "Breathe slow and feel the expand-contract movement in your belly. [pause 4s]",
        "Rest in this direct touch with the physical present. [pause 3s]"
      ];
      break;
    case 'Happy / Joyful':
      reflection = `I feel the beautiful warmth of your joy. [pause 2s] Let us expand this light.`;
      purpose = `This practice helps you absorb and radiate positive sentiment.`;
      steps = [
        "Allow a tiny, gentle smile to form at the corners of your lips. [pause 3s]",
        "Feel the warm sensation of breathing directly into your face. [pause 3s]",
        "Think of someone or something you appreciate, feeling that connection. [pause 4s]",
        "Let this bright, thankful feeling fill your entire body. [pause 4s]",
        "Inhale appreciation... exhale and share this warm energy. [pause 4s]",
        "Rest in this radiant, spacious state of simple happiness. [pause 3s]"
      ];
      break;
    case 'Euphoric / High-Energy':
      reflection = `I feel your incredible, high vibrations. [pause 2s] Let us root this power.`;
      purpose = `This practice helps you process and harmonize excitation.`;
      steps = [
        "Inhale deep, pulling this high energy down into your core. [pause 3s]",
        "Hold for two seconds... then exhale slow and ground it downwards. [pause 4s]",
        "Picture your energy flowing deep into the core of the earth. [pause 4s]",
        "Feel the incredible stability and poise under this raw vitality. [pause 3s]",
        "Breathe in a steady, harmonizing ocean-like rhythm. [pause 4s]",
        "Rest in this balanced, magnetic, clear-headed posture. [pause 3s]"
      ];
      break;
    case 'Calm / Content':
      reflection = `I join you in this peaceful space. [pause 2s] Let us lean into this rest.`;
      purpose = `This practice helps you rest in open, goal-free witnessing.`;
      steps = [
        "Sit elegantly, and let your awareness expand wide like the sky. [pause 3s]",
        "Notice sounds as they arise and dissolve in this open space. [pause 4s]",
        "Let thoughts arise and pass like wispy clouds in the wind. [pause 4s]",
        "There is nothing to change, nothing to improve, nothing to do. [pause 4s]",
        "Simply rest as the silent, peaceful witness of this moment. [pause 4s]",
        "Appreciate the quiet content of just being alive. [pause 3s]"
      ];
      break;
    case 'Breath Meditation':
      reflection = `Let us practice traditional breath awareness. [pause 2s] Simply observing.`;
      purpose = `This practice helps you slow mental activity using direct breath anchors.`;
      steps = [
        "Focus your mind entirely on the rim of your nostrils. [pause 3s]",
        "Feel the cool air passing in... and the warm air passing out. [pause 4s]",
        "Do not change the breath... let it breathe itself quietly. [pause 4s]",
        "Stay alert to the subtle touch of air at that single spot. [pause 4s]",
        "When your attention drifts, gently invite it back to the nostril. [pause 4s]",
        "Rest in this steady, narrow, deeply unified focus. [pause 3s]"
      ];
      break;
    case 'Breath Scanning Meditation':
      reflection = `Let us trace the physical expansion of your breathing. [pause 2s] Be present.`;
      purpose = `This practice helps you dissolve somatic tension systematically.`;
      steps = [
        "Inhale and feel the rising movement in your lower belly. [pause 3s]",
        "Let your breath expand into your rib cage and sides. [pause 4s]",
        "Feel the collarbones rising ever so gently on the peak inhale. [pause 4s]",
        "Exhale and feel the relaxation flowing from your throat down. [pause 4s]",
        "Notice how your entire physical frame breathes as one body. [pause 4s]",
        "Rest in this complete, harmonious somatic breathing field. [pause 3s]"
      ];
      break;
    case 'Neutral / Balanced':
    default:
      reflection = `I welcome you. [pause 2s] Let us rest in spacious observation.`;
      purpose = `This practice helps you stay present and balanced.`;
      steps = [
        "Find a stable upright posture, resting your hands comfortably. [pause 3s]",
        "Bring your attention gently to the rise and fall of your chest. [pause 3s]",
        "Observe the quiet pause between each in-breath and out-breath. [pause 4s]",
        "If a thought arises, simply note: 'thinking' and let it pass. [pause 4s]",
        "Rest in this pure, spacious, non-reactive awareness of the present. [pause 4s]",
        "Return your focus to the breath whenever you need an anchor. [pause 3s]"
      ];
      break;
  }

  return {
    id: `sess_local_${Date.now()}`,
    state,
    techniqueName: meta.technique,
    stateReflection: reflection,
    purpose,
    steps,
    durationText: "Duration: 5 minutes",
    exitInstructions: exit,
    breathPacing: meta.pacing,
    enhancements: getLocalEnhancements(state)
  };
}

function adaptLocalSession(
  currentSession: MeditationSession,
  feedbackType: FeedbackType,
  userText?: string
): MeditationSession {
  let steps = [...currentSession.steps];
  let techniqueName = currentSession.techniqueName;
  let breathPacing = { ...currentSession.breathPacing };
  let reflection = `Adjusting your practice and adapting to your needs right now. [pause 2s] Let us proceed.`;

  if (feedbackType === 'distracted') {
    techniqueName = 'Somatic Breath Counting Rescue';
    reflection = `I hear you. Distractions are natural. [pause 2s] Let us simplify.`;
    steps = [
      "Let us pause any visualizations. Breathe in slowly. [pause 3s]",
      "As you breathe out, count silently: one. [pause 3s]",
      "Breathe in... breathe out, count: two. [pause 3s]",
      "Simply keep the count from one up to four. [pause 4s]",
      "If you drift, just begin again at one. Breathe in. [pause 3s]",
      "Let your mind rest only on the numbers. One... two... [pause 4s]"
    ];
  } else if (feedbackType === 'anxiety_increased') {
    techniqueName = 'Tactile Grounding & Slow Exhale Rescue';
    reflection = `It is completely okay that anxiety rose. [pause 2s] Let us ground immediately.`;
    breathPacing = { inhale: 4, hold1: 0, exhale: 8, hold2: 0, type: 'extended' };
    steps = [
      "First, open your eyes and look at the floor. Feel your feet. [pause 3s]",
      "Let out a deep, long, audible sigh through your mouth. [pause 4s]",
      "Place both hands flat against your thighs, squeezing gently. [pause 4s]",
      "Breathe in for four seconds... and breathe out for eight seconds. [pause 4s]",
      "Feel the absolute solidity of the floor holding you up. [pause 4s]",
      "We are slow and safe right here in this physical room. [pause 3s]"
    ];
  } else if (feedbackType === 'feeling_better') {
    techniqueName = currentSession.techniqueName;
    reflection = `That is wonderful to hear. [pause 2s] Let us gently integrate this feeling.`;
    steps = [
      "Appreciate this gentle shift in your nervous system. [pause 3s]",
      "Inhale peace, feeling the muscles across your chest relax. [pause 4s]",
      "Let go of any remaining effort. Breathe naturally. [pause 4s]",
      "Savor this quiet sense of calm and gentle lightness. [pause 4s]",
      "Rest in this spaciousness for a few silent breath cycles. [pause 4s]"
    ];
  } else {
    // freeform or other Adjustments
    const textSample = userText ? userText.toLowerCase() : '';
    if (textSample.includes('pain') || textSample.includes('hurt') || textSample.includes('ach') || textSample.includes('back')) {
      techniqueName = 'Physical Comfort Adjustment';
      reflection = `I understand you are experiencing discomfort. [pause 2s] Let us adapt.`;
      steps = [
        "First, adjustments in posture are encouraged. Shift and get comfortable. [pause 4s]",
        "Do not fight the physical sensation. Simply observe it. [pause 4s]",
        "Visualize your breath moving into and softening that boundary. [pause 4s]",
        "Shed any expectation of holding still or being perfect. [pause 4s]"
      ];
    } else if (textSample.includes('sleep') || textSample.includes('tire') || textSample.includes('slumber') || textSample.includes('bed')) {
      techniqueName = 'Hypnotic Deep Wind Down';
      reflection = `I hear that sleepiness or heavy tiredness is here. [pause 2s] Let us transition supportively.`;
      steps = [
        "Let your entire body go completely soft and heavy. [pause 4s]",
        "Observe each breath like a quiet wave washing ashore. [pause 4s]",
        "Inhale light... exhale and release the entire day behind you. [pause 4s]",
        "Let yourself drift down into the natural rhythm of resting. [pause 4s]"
      ];
    } else {
      techniqueName = 'AI Adaptive Response Practice';
      reflection = `I hear you. [pause 1.5s] Let us adjust your current focus to accommodate this. [pause 2s]`;
      steps = [
        "Release any expectation of how this session should go. [pause 3s]",
        "Breathe in quietly, acknowledging exactly what is present. [pause 4s]",
        "Breathe out, and let any resistance or tension subside. [pause 4s]",
        "Stay with the simple movement of the breath: expansion... release. [pause 4s]"
      ];
    }
  }

  return {
    ...currentSession,
    id: `sess_adapted_${Date.now()}`,
    techniqueName,
    stateReflection: reflection,
    steps,
    breathPacing
  };
}

const MEDITATION_SCHEMA = {
  type: "object",
  properties: {
    detectedState: {
      type: "string",
      description: "Must be exactly one of the known EmotionalStates: 'Anxious / Overthinking', 'Stressed / Overwhelmed', 'Sad / Low mood', 'Angry / Irritated', 'Restless / Distracted', 'Neutral / Balanced', 'Tired / Burnout', 'Emotionally numb / Disconnected', 'Happy / Joyful', 'Euphoric / High-Energy', 'Calm / Content', 'Breath Meditation', 'Breath Scanning Meditation'."
    },
    techniqueName: { type: "string" },
    stateReflection: { type: "string", description: "A very brief, 1-sentence supportive reflection, strictly under 15 words. Structured for spoken audio (e.g. 'I hear you. Let us take a moment. [pause 2s]')." },
    purpose: { type: "string", description: "Purpose statement under 10 words starting with: 'This practice helps you ___.' Keep it extremely simple and short." },
    steps: {
      type: "array",
      items: { type: "string" },
      description: "A list of exactly 5-6 spoken steps. Each step must be extremely short, direct, simple, and contain pause tags like '[pause 2s]' or '[pause 4s]' (e.g. 'Now, feel your hands. [pause 2s] Let them rest. [pause 4s]'). One idea per sentence. Keep under 15 words total per step."
    },
    durationText: { type: "string", description: "Explicitly 'Duration: 5 minutes'" },
    exitInstructions: { type: "string", description: "Always end with a simple spoken phrase under 8 words containing a pause, e.g. 'Slowly return. [pause 2s] Open your eyes.'" },
    breathPacing: {
      type: "object",
      properties: {
        inhale: { type: "integer" },
        hold1: { type: "integer" },
        exhale: { type: "integer" },
        hold2: { type: "integer" },
        type: { type: "string" }
      },
      required: ["inhale", "hold1", "exhale", "hold2", "type"]
    },
    enhancements: {
      type: "object",
      properties: {
        journalingPrompts: { type: "array", items: { type: "string" }, description: "3 simple questions to reflect on under 12 words each." },
        habitRoutine: { type: "array", items: { type: "string" }, description: "3 short daily micro-actions under 15 words each." },
        sleepWindDown: { type: "array", items: { type: "string" }, description: "3 simple, brief wind-down tips under 15 words each." },
        breathworkProgression: { type: "array", items: { type: "string" }, description: "3 short progression targets under 15 words each." }
      },
      required: ["journalingPrompts", "habitRoutine", "sleepWindDown", "breathworkProgression"]
    }
  },
  required: [
    "detectedState",
    "techniqueName",
    "stateReflection",
    "purpose",
    "steps",
    "durationText",
    "exitInstructions",
    "breathPacing",
    "enhancements"
  ]
};

export async function generateInitialSession(input: { description?: string; explicitState?: string }): Promise<MeditationSession> {
  let targetState: EmotionalState = 'Neutral / Balanced';
  let contextPrompt = '';

  if (input.explicitState && STATE_MAPPINGS[input.explicitState]) {
    targetState = input.explicitState as EmotionalState;
    contextPrompt = `The user clicked explicitly: "${targetState}". Description: "${input.description || ''}"`;
  } else if (input.description) {
    contextPrompt = `The user describes their mental state like this: "${input.description}"`;
    
    // Quick keyword classification logic in case of local offline fallback choice
    const descLower = input.description.toLowerCase();
    if (descLower.includes('anxi') || descLower.includes('worry') || descLower.includes('panic') || descLower.includes('thinking') || descLower.includes('nervous')) {
      targetState = 'Anxious / Overthinking';
    } else if (descLower.includes('stress') || descLower.includes('overwhelm') || descLower.includes('pressur') || descLower.includes('busy')) {
      targetState = 'Stressed / Overwhelmed';
    } else if (descLower.includes('sad') || descLower.includes('depress') || descLower.includes('blue') || descLower.includes('grief') || descLower.includes('cry')) {
      targetState = 'Sad / Low mood';
    } else if (descLower.includes('angr') || descLower.includes('mad') || descLower.includes('irritat') || descLower.includes('frustrat') || descLower.includes('annoy')) {
      targetState = 'Angry / Irritated';
    } else if (descLower.includes('distract') || descLower.includes('fidget') || descLower.includes('focus') || descLower.includes('wander')) {
      targetState = 'Restless / Distracted';
    } else if (descLower.includes('exhaust') || descLower.includes('tire') || descLower.includes('burnout') || descLower.includes('sleepy') || descLower.includes('fatigu')) {
      targetState = 'Tired / Burnout';
    } else if (descLower.includes('numb') || descLower.includes('empty') || descLower.includes('blank') || descLower.includes('disconnect')) {
      targetState = 'Emotionally numb / Disconnected';
    } else if (descLower.includes('happ') || descLower.includes('joy') || descLower.includes('excit') || descLower.includes('smil') || descLower.includes('glad')) {
      targetState = 'Happy / Joyful';
    } else if (descLower.includes('high energy') || descLower.includes('hyper') || descLower.includes('euphor') || descLower.includes('buzz')) {
      targetState = 'Euphoric / High-Energy';
    } else if (descLower.includes('calm') || descLower.includes('peac') || descLower.includes('content') || descLower.includes('still')) {
      targetState = 'Calm / Content';
    } else if (descLower.includes('scan') || descLower.includes('body')) {
      targetState = 'Breath Scanning Meditation';
    } else if (descLower.includes('breath') || descLower.includes('breathing')) {
      targetState = 'Breath Meditation';
    }
  }

  // Create a Cloudflare Edge-style Cache Key normalization
  const stateKey = input.explicitState ? `state:${input.explicitState}` : "";
  const descKey = input.description ? `desc:${input.description.trim().toLowerCase().replace(/\s+/g, " ")}` : "";
  const cacheKey = [stateKey, descKey].filter(Boolean).sort().join("__");

  if (cacheKey && cloudflareCdnCache.has(cacheKey)) {
    console.log(`[Cloudflare CDN Cache Hit] Serving buffered technique directly to reduce API costs. CacheKey: "${cacheKey}"`);
    const cached = cloudflareCdnCache.get(cacheKey);
    return {
      ...cached,
      id: `sess_${Date.now()}` // Refresh dynamic session identifier
    };
  }

  const defaultMeta = STATE_MAPPINGS[targetState] || STATE_MAPPINGS['Neutral / Balanced'];

  // Check if Claude API key exists, otherwise switch to local high-fidelity generator directly
  if (!hasClaudeKey()) {
    console.warn(`[Claude API] ANTHROPIC_API_KEY is not configured. Activating ultra-reliable high-fidelity local session factory.`);
    const fallbackSess = generateRuleBasedSession(targetState);
    if (cacheKey) {
      cloudflareCdnCache.set(cacheKey, fallbackSess);
    }
    return fallbackSess;
  }

  const systemInstruction = `
You are an advanced Personalised Meditation Coach AI. Your purpose is to structure clean, secular, restorative, and evidence-informed meditation instruction sets tailored to a user's emotional state.
You must guide the user calmly, displaying profound empathy while avoiding motivational clichés, flowery hype, or spiritual doctrines.
Be caring, safe, comforting, and absolutely precise.

CRITICAL TEXT AND AUDIO SPOKEN RULES:
Every single piece of generated text (stateReflection, purpose, steps, exitInstructions, enhancements) MUST follow the Keep It Short and Simple (KISS) format.
Write ONLY for spoken audio:
- Use very short sentences.
- Use simple everyday language.
- Add frequent pauses using: [pause 2s], [pause 4s]. Place these inside the step array string items (e.g., "Breathing in. [pause 2s] Breathing out. [pause 4s]").
- Speak slowly and calmly.
- One idea per sentence.
- Avoid long paragraphs.
- Avoid poetic, spiritual, philosophical, wise, dramatic, or heavy language.
- STRICTOR RULE: ABSOLUTELY AVOID THESE WORDS: "journey", "embrace", "serenity", "deep within", "allow yourself".
- Structure of the 5-6 steps:
  1. Gentle opening (Step 1)
  2. Breathing guidance (Step 2)
  3. Simple grounding (Step 3)
  4. Quiet pauses (Step 4)
  5. Gentle closing (Step 5 & 6)
- Keep meditation between 5-10 minutes (duration is 5 minutes).

Rule mappings for techniques dependent on verified emotional state:
- 'Anxious / Overthinking' -> Box breathing + grounding (5-4-3-2-1)
- 'Stressed / Overwhelmed' -> Body scan + extended exhale breathing
- 'Sad / Low mood' -> Self-compassion meditation (loving-kindness light version)
- 'Angry / Irritated' -> Cooling breath + observation of sensations
- 'Restless / Distracted' -> Focused attention breath counting (1-10 reset loop)
- 'Neutral / Balanced' -> Insight meditation (vipassana-style observation)
- 'Tired / Burnout' -> Yoga nidra micro-relaxation (5-8 min)
- 'Emotionally numb / Disconnected' -> Sensory reconnection + gentle grounding
- 'Happy / Joyful' -> Positive sentiment expansion & smiling-breath appreciation
- 'Euphoric / High-Energy' -> Harmonizing excitation into physically peaceful soma
- 'Calm / Content' -> Resting in open spacious witnessing without goals
- 'Breath Meditation' -> Samatha breathing mindfulness (Anapana) focusing on nostril breath sensations.
- 'Breath Scanning Meditation' -> Somatic somatic breath scanning sequentially detailing regions with respiratory expansion.

Return the session by calling the meditation_session tool.
`;

  const userQuery = `
Based on the following query:
${contextPrompt}

Classify their sentiment into one of the known states. Determine the most constructive techniques of meditation to apply.
Generate an incredible, step-by-step meditation session that follows this structure.
If the description matches a state other than the explicit selection, you can adjust the detected state to whatever is most emotionally fitting (Anxious, Stressed, Low mood, Sad, Breath Meditation, etc.).

Technique default profile suggestion to incorporate:
Technique: ${defaultMeta.technique}
Focus: ${defaultMeta.focus}
Pacing: ${JSON.stringify(defaultMeta.pacing)}
`;

  try {
    const data = await callClaude(systemInstruction, userQuery);

    const finalResult: MeditationSession = {
      id: `sess_${Date.now()}`,
      state: data.detectedState as EmotionalState,
      techniqueName: data.techniqueName || defaultMeta.technique,
      stateReflection: data.stateReflection || `I can sense you may be feeling ${data.detectedState} right now.`,
      purpose: data.purpose || `This practice will guide you to peaceful equilibrium.`,
      steps: data.steps || [
        "Find a comfortable posture where you can sit alert yet relaxed.",
        "Close your eyes softly or let them rest in a gaze two feet ahead.",
        "Bring physical attention to the movement of breath inside your nostrils.",
        "Let every breath find its natural volume without forcing.",
        "Witness any passing thoughts with calm, gentle curiosity.",
        "Continue breathing slowly, finding a solid baseline of quiet presence."
      ],
      durationText: data.durationText || "Duration: 5–10 minutes",
      breathPacing: data.breathPacing || defaultMeta.pacing,
      exitInstructions: data.exitInstructions || "Slowly bring your awareness back.",
      enhancements: data.enhancements
    };

    // Cache in our Cloudflare CDN emulator
    if (cacheKey) {
      cloudflareCdnCache.set(cacheKey, finalResult);
      console.log(`[Cloudflare CDN Cache Miss] Saved new technique to Cloudflare KV Edge: "${cacheKey}"`);
    }

    return finalResult;
  } catch (err: any) {
    console.error(`[Claude API Exception] Live invocation failed. Reverting immediately to local static generation framework:`, err);
    const fallbackSess = generateRuleBasedSession(targetState);
    if (cacheKey) {
      cloudflareCdnCache.set(cacheKey, fallbackSess);
    }
    return fallbackSess;
  }
}

export async function generateAdaptiveFeedback(
  currentSession: MeditationSession,
  feedbackType: FeedbackType,
  userText?: string
): Promise<MeditationSession> {
  // Graceful redirection helper if key is absent
  if (!hasClaudeKey()) {
    console.warn(`[Claude API Feedback] No key detected. Utilizing resilient rule-based adaptation.`);
    return adaptLocalSession(currentSession, feedbackType, userText);
  }

  const systemInstruction = `
You are an advanced, supportive AI Meditation Coach guiding an active meditation. The user is currently in the middle of a session and has triggered a feedback loop.

You must adapt the session based on these strict guidelines:
1. If user is distracted ('distracted') -> simplify instruction steps down to ultra-clear breathing anchors (easy breath-counting resets, less words).
2. If user's anxiety increases ('anxiety_increased') -> switch to grounding immediately (e.g. the 5-4-3-2-1 visual/sensory technique, feel heavy in seat, safe direct grounding). Force pacing to grounding.
3. If user feels better ('feeling_better') -> shorten the steps, leading gracefully to final integration. Remove extraneous loops.
4. If they give custom freeform text ('freeform') -> adjust instructions dynamically to address their specific hurdle, remaining incredibly grounded.

Prioritize psychological stability over completing the original meditation list. Return the updated meditation guide in the exact same format schema.

CRITICAL TEXT AND AUDIO SPOKEN RULES:
Every single piece of updated text must follow the Keep It Short and Simple (KISS) format. 
Write ONLY for spoken audio:
- Use very short sentences.
- Use simple everyday language.
- Add frequent pauses using: [pause 2s], [pause 4s].
- Speak slowly and calmly.
- One idea per sentence.
- Avoid long paragraphs.
- Avoid poetic, spiritual, philosophical, wise, dramatic, or heavy language.
- STRICTOR RULE: ABSOLUTELY AVOID THESE WORDS: "journey", "embrace", "serenity", "deep within", "allow yourself".
`;

  const userQuery = `
Original Session Information:
- Current State: ${currentSession.state}
- Current Technique: ${currentSession.techniqueName}
- Current Steps: ${JSON.stringify(currentSession.steps)}
- Current Pacing: ${JSON.stringify(currentSession.breathPacing)}

User Feedback trigger: "${feedbackType}"
User Custom Input text (if any): "${userText || ''}"

Please adapt the meditation steps, stateReflection, purpose, techniqueName, and breathPacing to respond directly to this feedback.
Return a full, revised session object, adjusting steps so the user can continue the session safely and with perfect accommodation.
`;

  try {
    const data = await callClaude(systemInstruction, userQuery);

    return {
      id: `sess_${Date.now()}`,
      state: currentSession.state,
      techniqueName: data.techniqueName || currentSession.techniqueName,
      stateReflection: data.stateReflection || `Navigating this moment...`,
      purpose: data.purpose || currentSession.purpose,
      steps: data.steps || currentSession.steps,
      durationText: currentSession.durationText,
      breathPacing: data.breathPacing || currentSession.breathPacing,
      exitInstructions: data.exitInstructions || currentSession.exitInstructions,
      enhancements: data.enhancements || currentSession.enhancements
    };
  } catch (err: any) {
    console.error(`[Claude API Feedback Exception] Adapting session fallback locally:`, err);
    return adaptLocalSession(currentSession, feedbackType, userText);
  }
}

// Map the custom naming helper format correctly
function generateRuleBasedSession(state: EmotionalState): MeditationSession {
  return generateLocalMockSession(state);
}
